# Load Testing Guide - Concurrent Booking Tests

This guide explains how to run load tests to verify that the booking system correctly prevents double-bookings under high concurrency.

## 🎯 What We're Testing

The load tests verify that when **1000+ users try to book the same room at the exact same time**, only **ONE booking succeeds** and all others are properly rejected. This validates our PostgreSQL pessimistic locking mechanism (`FOR UPDATE`).

## 📋 Prerequisites

1. **Backend server running** on `http://localhost:5000`
2. **Database with test data**:
   - At least one test user account
   - At least one room available
3. **Artillery installed** (see installation below)

## 🚀 Quick Start

### 1. Install Artillery

```bash
cd backend
npm install --save-dev artillery
```

### 2. Configure Test Parameters

Edit `load-tests/artillery.yml` and update:

```yaml
variables:
  testRoomId: 1  # Change to a valid room ID in your database
```

Also update the login credentials in the YAML file:
```yaml
json:
  email: "user@example.com"      # Change to a real test user
  password: "password123"         # Change to the user's password
```

### 3. Run the Load Test

```bash
# From the backend directory
npm run load:test

# Or run Artillery directly
npx artillery run load-tests/artillery.yml
```

### 4. Review Results

Artillery will output:
- Real-time progress during the test
- Summary statistics at the end
- Custom validation results from our processor

Look for this in the output:
```
📊 LOAD TEST RESULTS - Concurrent Booking Test
============================================================
Total Requests:        1000
✅ Successful Bookings: 1
🚫 Already Booked:      999
❌ Other Errors:        0
============================================================
✅ TEST PASSED: Exactly 1 booking succeeded (no double-booking!)
```

## 📊 Understanding the Results

### Success Criteria

✅ **PASS**: Exactly 1 booking succeeds, all others fail with "already booked" error

❌ **FAIL**: More than 1 booking succeeds (indicates double-booking bug)

⚠️ **WARNING**: 0 bookings succeed (configuration issue)

### Artillery Metrics

Artillery provides detailed metrics:

- **http.request_rate**: Requests per second
- **http.response_time**: Response time percentiles (p50, p95, p99)
- **http.codes.201**: Number of successful bookings (should be 1)
- **http.codes.400**: Number of "already booked" rejections (should be ~999)

## 🔧 Test Scenarios

### Scenario 1: Same Room, Same Time (Default)

**Purpose**: Test race condition handling

**Configuration**: All users try to book room #1 from 2:00 PM - 3:00 PM

**Expected Result**: Only 1 succeeds

**Weight**: 100 (enabled)

### Scenario 2: Different Rooms (Optional)

**Purpose**: Verify system can handle many concurrent bookings when there's no conflict

**Configuration**: Each user books a different room or different time

**Expected Result**: All succeed

**Weight**: 0 (disabled by default)

To enable, edit `artillery.yml`:
```yaml
- name: "Different Rooms Test - Should All Succeed"
  weight: 1  # Change from 0 to 1
```

## 🧪 Test Phases

The load test runs in 3 phases:

### Phase 1: Warm-up (10 seconds)
- **Load**: 1 user/second
- **Purpose**: Verify basic connectivity
- **Expected**: All requests succeed (different times)

### Phase 2: Spike Test (5 seconds)
- **Load**: 20 users/second = ~100 concurrent users
- **Purpose**: Test moderate concurrency
- **Expected**: 1 success, 99 failures

### Phase 3: Extreme Load (10 seconds)
- **Load**: 100 users/second = ~1000 concurrent users
- **Purpose**: Stress test the locking mechanism
- **Expected**: 1 success, 999 failures

## 🗄️ Database Verification

After running tests, verify no double-bookings in the database:

```sql
-- Check for duplicate bookings (should return 0 rows)
SELECT room_id, start_time, end_time, COUNT(*) as booking_count
FROM bookings
WHERE room_id = 1  -- Your test room ID
  AND start_time >= NOW()
GROUP BY room_id, start_time, end_time
HAVING COUNT(*) > 1;
```

## 🧹 Cleanup Test Data

After testing, clean up the test bookings:

```sql
-- Delete all test bookings created in the future
DELETE FROM bookings
WHERE room_id = 1  -- Your test room ID
  AND start_time >= NOW()
  AND title LIKE 'Load Test%';
```

Or use the admin panel to delete test bookings manually.

## 🐛 Troubleshooting

### Issue: "Connection refused" or "ECONNREFUSED"

**Solution**: Make sure the backend server is running on `http://localhost:5000`

```bash
cd backend
npm run dev
```

### Issue: All requests fail with 401 Unauthorized

**Solution**: Update the login credentials in `artillery.yml` to match a real user in your database

### Issue: All requests fail with "Room not found"

**Solution**: Update `testRoomId` in `artillery.yml` to a valid room ID from your database

```sql
-- Find available room IDs
SELECT id, name FROM rooms LIMIT 5;
```

### Issue: 0 bookings succeed

**Possible causes**:
1. Room doesn't exist
2. Login credentials are wrong
3. Time slot is in the past
4. Database connection issues

**Solution**: Check backend logs for detailed error messages

### Issue: Multiple bookings succeed (DOUBLE-BOOKING!)

**This is a critical bug!** It means the pessimistic locking is not working correctly.

**Debug steps**:
1. Check that `FOR UPDATE` is in the SQL query in `booking.service.ts`
2. Verify database transactions are being used (`BEGIN`/`COMMIT`)
3. Check PostgreSQL logs for deadlocks or lock timeouts
4. Verify the database isolation level

## 📈 Advanced Usage

### Generate HTML Report

```bash
npx artillery run --output report.json load-tests/artillery.yml
npx artillery report report.json
```

This creates an HTML report with graphs and detailed metrics.

### Adjust Concurrency

Edit `artillery.yml` to change the load:

```yaml
phases:
  # For 5000 concurrent users
  - duration: 10
    arrivalRate: 500
    name: "Extreme Load - 5000 concurrent"
```

### Test Against Production

⚠️ **WARNING**: Only do this if you have permission and a cleanup plan!

```bash
# Set target in artillery.yml
config:
  target: "https://your-production-url.com"
```

## 📚 Additional Resources

- [Artillery Documentation](https://www.artillery.io/docs)
- [PostgreSQL Row Locking](https://www.postgresql.org/docs/current/explicit-locking.html)
- [Understanding Race Conditions](https://en.wikipedia.org/wiki/Race_condition)

## 🎓 What This Tests

✅ **Pessimistic Locking**: `FOR UPDATE` prevents concurrent modifications

✅ **Transaction Isolation**: Database transactions maintain consistency

✅ **Error Handling**: System properly rejects conflicting bookings

✅ **Performance**: System handles high load without crashes

✅ **Data Integrity**: No double-bookings in the database
