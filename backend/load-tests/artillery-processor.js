/**
 * Artillery Custom Processor
 * This file contains custom functions for Artillery load testing
 */

// Track booking results
const bookingResults = {
    success: 0,
    alreadyBooked: 0,
    otherErrors: 0,
    totalRequests: 0
};

/**
 * Generate booking data with the SAME time slot for all requests
 * This ensures we're testing concurrent bookings for the exact same time period
 */
function generateBookingData(requestParams, context, ee, next) {
    // Use a fixed future time that all concurrent requests will try to book
    // This is crucial for testing race conditions
    const now = new Date();
    const startTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour duration

    context.vars.startTime = startTime.toISOString();
    context.vars.endTime = endTime.toISOString();

    return next();
}

/**
 * Generate booking data with DIFFERENT time slots
 * Used for testing that non-conflicting bookings all succeed
 */
function generateDifferentRoomBooking(requestParams, context, ee, next) {
    const now = new Date();
    // Add random offset so each booking is at a different time
    const randomOffset = Math.floor(Math.random() * 24) * 60 * 60 * 1000; // Random hour in next 24 hours
    const startTime = new Date(now.getTime() + randomOffset);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000);

    context.vars.startTime = startTime.toISOString();
    context.vars.endTime = endTime.toISOString();

    // Random room ID between 1-10
    context.vars.randomRoomId = Math.floor(Math.random() * 10) + 1;

    return next();
}

/**
 * Validate and track booking responses
 * This helps us verify that only ONE booking succeeded
 */
function validateBookingResponse(requestParams, response, context, ee, next) {
    bookingResults.totalRequests++;

    if (response.statusCode === 201) {
        bookingResults.success++;
        console.log(`✅ Booking SUCCESS (Total successes: ${bookingResults.success})`);
    } else if (response.statusCode === 400 || response.statusCode === 409) {
        // Check if it's the "already booked" error
        const body = typeof response.body === 'string' ? response.body : JSON.stringify(response.body);
        if (body.includes('đã có người đặt') || body.includes('already booked')) {
            bookingResults.alreadyBooked++;
        } else {
            bookingResults.otherErrors++;
            console.log(`⚠️  Other error: ${body}`);
        }
    } else {
        bookingResults.otherErrors++;
        console.log(`❌ Unexpected status: ${response.statusCode}`);
    }

    return next();
}

/**
 * Print final results after all tests complete
 */
function printResults(context, ee, next) {
    console.log('\n' + '='.repeat(60));
    console.log('📊 LOAD TEST RESULTS - Concurrent Booking Test');
    console.log('='.repeat(60));
    console.log(`Total Requests:        ${bookingResults.totalRequests}`);
    console.log(`✅ Successful Bookings: ${bookingResults.success}`);
    console.log(`🚫 Already Booked:      ${bookingResults.alreadyBooked}`);
    console.log(`❌ Other Errors:        ${bookingResults.otherErrors}`);
    console.log('='.repeat(60));

    // Verify that only ONE booking succeeded
    if (bookingResults.success === 1) {
        console.log('✅ TEST PASSED: Exactly 1 booking succeeded (no double-booking!)');
    } else if (bookingResults.success === 0) {
        console.log('⚠️  WARNING: No bookings succeeded. Check if test user exists and room is available.');
    } else {
        console.log(`❌ TEST FAILED: ${bookingResults.success} bookings succeeded (DOUBLE-BOOKING DETECTED!)`);
    }
    console.log('='.repeat(60) + '\n');

    return next ? next() : null;
}

// Export functions for Artillery to use
module.exports = {
    generateBookingData,
    generateDifferentRoomBooking,
    validateBookingResponse,
    afterScenario: printResults
};
