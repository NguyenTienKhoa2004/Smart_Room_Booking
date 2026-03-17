/**
 * 📊 Redis Cache Benchmark Script
 * 
 * Đo lường hiệu năng: Cache Hit vs Cache Miss (DB query)
 * Chạy: npx ts-node src/scripts/benchmarkCache.ts
 * 
 * Yêu cầu: PostgreSQL và Redis phải đang chạy
 */

import db from '../config/database';
import redis from '../config/redis';
import { RoomService } from '../services/room.service';

interface BenchmarkResult {
    label: string;
    times: number[];
    avg: number;
    min: number;
    max: number;
    p50: number;
    p95: number;
    p99: number;
    dbQueries: number;
}

function percentile(arr: number[], p: number): number {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil((p / 100) * sorted.length) - 1;
    return sorted[Math.max(0, index)];
}

function formatMs(ms: number): string {
    return ms < 1 ? `${(ms * 1000).toFixed(0)}µs` : `${ms.toFixed(2)}ms`;
}

async function benchmark(
    label: string,
    fn: () => Promise<any>,
    iterations: number
): Promise<BenchmarkResult> {
    const times: number[] = [];

    // Warm-up (3 lần, không tính)
    for (let i = 0; i < 3; i++) {
        await fn();
    }

    for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await fn();
        const end = performance.now();
        times.push(end - start);
    }

    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const sorted = [...times].sort((a, b) => a - b);

    return {
        label,
        times,
        avg,
        min: sorted[0],
        max: sorted[sorted.length - 1],
        p50: percentile(times, 50),
        p95: percentile(times, 95),
        p99: percentile(times, 99),
        dbQueries: 0,
    };
}

async function main() {
    const ITERATIONS = 100;
    const filters = { capacity: 5 };

    console.log('═'.repeat(70));
    console.log('📊 REDIS CACHE BENCHMARK — Smart Room Booking');
    console.log('═'.repeat(70));
    console.log(`Iterations per test: ${ITERATIONS}`);
    console.log(`Filter: capacity >= 5`);
    console.log('');

    // ─────────────────────────────────────────────
    // Test 1: Direct DB query (bypass cache hoàn toàn)
    // ─────────────────────────────────────────────
    console.log('🔄 [Test 1] Đang benchmark: Direct DB query (no cache)...');

    const dbResult = await benchmark(
        '❌ No Cache (DB query mỗi lần)',
        async () => {
            // Xóa cache trước mỗi lần gọi → ép phải query DB
            await redis.del(`rooms:available:${JSON.stringify(
                Object.fromEntries(Object.entries(filters).sort())
            )}`);
            await RoomService.getAllRooms(filters);
        },
        ITERATIONS
    );
    dbResult.dbQueries = ITERATIONS;

    // ─────────────────────────────────────────────
    // Test 2: Redis cache hit (gọi lần 1 để seed cache, sau đó đo cache hit)
    // ─────────────────────────────────────────────
    console.log('🔄 [Test 2] Đang benchmark: Redis cache hit...');

    // Seed cache trước
    await RoomService.getAllRooms(filters);

    const cacheResult = await benchmark(
        '✅ Cache Hit (Redis)',
        async () => {
            await RoomService.getAllRooms(filters);
        },
        ITERATIONS
    );
    cacheResult.dbQueries = 1; // chỉ query DB 1 lần duy nhất (lần seed)

    // ─────────────────────────────────────────────
    // Test 3: Raw Redis GET (đo latency thuần Redis)
    // ─────────────────────────────────────────────
    console.log('🔄 [Test 3] Đang benchmark: Raw Redis GET latency...');

    const rawRedisResult = await benchmark(
        '⚡ Raw Redis GET',
        async () => {
            await redis.get(`rooms:available:${JSON.stringify(
                Object.fromEntries(Object.entries(filters).sort())
            )}`);
        },
        ITERATIONS
    );

    // ─────────────────────────────────────────────
    // Test 4: Raw DB query (đo latency thuần PostgreSQL)
    // ─────────────────────────────────────────────
    console.log('🔄 [Test 4] Đang benchmark: Raw PostgreSQL query latency...');

    const rawDbResult = await benchmark(
        '🐘 Raw PostgreSQL Query',
        async () => {
            const now = new Date();
            const endTime = new Date(now.getTime() + 60 * 60 * 1000);
            await db.query(
                `SELECT r.*, 
                 CASE 
                     WHEN EXISTS (
                         SELECT 1 FROM bookings b 
                         WHERE b.room_id = r.id 
                         AND b.start_time < $2 
                         AND b.end_time > $1
                     ) THEN 'reserved'
                     ELSE 'available'
                 END as status
                 FROM rooms r
                 WHERE r.capacity >= $3
                 ORDER BY r.name ASC`,
                [now, endTime, 5]
            );
        },
        ITERATIONS
    );

    // ─────────────────────────────────────────────
    // 📊 RESULTS
    // ─────────────────────────────────────────────
    console.log('\n');
    console.log('═'.repeat(70));
    console.log('📊 BENCHMARK RESULTS');
    console.log('═'.repeat(70));

    const results = [dbResult, cacheResult, rawRedisResult, rawDbResult];

    console.log('\n┌─────────────────────────────┬──────────┬──────────┬──────────┬──────────┬──────────┐');
    console.log('│ Test                        │   Avg    │   Min    │   P50    │   P95    │   P99    │');
    console.log('├─────────────────────────────┼──────────┼──────────┼──────────┼──────────┼──────────┤');

    for (const r of results) {
        const label = r.label.padEnd(27);
        console.log(
            `│ ${label} │ ${formatMs(r.avg).padStart(8)} │ ${formatMs(r.min).padStart(8)} │ ${formatMs(r.p50).padStart(8)} │ ${formatMs(r.p95).padStart(8)} │ ${formatMs(r.p99).padStart(8)} │`
        );
    }
    console.log('└─────────────────────────────┴──────────┴──────────┴──────────┴──────────┴──────────┘');

    // ─────────────────────────────────────────────
    // 📈 IMPROVEMENT CALCULATION
    // ─────────────────────────────────────────────
    const speedup = dbResult.avg / cacheResult.avg;
    const reductionPercent = ((dbResult.avg - cacheResult.avg) / dbResult.avg * 100);
    const dbLoadReduction = ((dbResult.dbQueries - cacheResult.dbQueries) / dbResult.dbQueries * 100);

    console.log('\n');
    console.log('═'.repeat(70));
    console.log('📈 PERFORMANCE IMPROVEMENT SUMMARY');
    console.log('═'.repeat(70));
    console.log(`   No-Cache avg response:    ${formatMs(dbResult.avg)}`);
    console.log(`   Cache-Hit avg response:   ${formatMs(cacheResult.avg)}`);
    console.log(`   ─────────────────────────────────────`);
    console.log(`   🚀 Speed improvement:     ${speedup.toFixed(1)}x faster`);
    console.log(`   📉 Response time reduced: ${reductionPercent.toFixed(1)}%`);
    console.log(`   💾 DB queries reduced:    ${dbLoadReduction.toFixed(0)}% (${dbResult.dbQueries} → ${cacheResult.dbQueries} queries)`);
    console.log(`   ⏱️  Time saved per req:    ${formatMs(dbResult.avg - cacheResult.avg)}`);
    console.log('');
    console.log('═'.repeat(70));
    console.log('');

    // Cleanup
    await redis.quit();
    await db.end();
    process.exit(0);
}

main().catch((err) => {
    console.error('Benchmark failed:', err);
    process.exit(1);
});
