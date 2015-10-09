/*
    The grade buckets defined in the configuration should be ordered from
    highest grade value, to lowest grade value. Otherwise changing the
    rounding configuration breaks.
*/
var config = {
    buckets: ['A', 'B', 'C', 'D', 'F'],
    rounding: 'floor' // Floor | Ceiling
}

/* Determine if an integer passed into the function is a numerical value */
function isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

/* Sort an array in descending order */
function sort(unsortedList) {
    return unsortedList.sort(function(a, b) { return b - a; });
}

/* Extract duplicates from an array into a separate array */
function findDuplicates(sortedList) {
    var results = [];
    for (var i = 0; i < sortedList.length - 1; i++) {
        if (sortedList[i + 1] == sortedList[i]) {
            results.push(sortedList[i]);
        }
    }
    return results;
}

/* Remove duplicates from an array, do not store them */
function removeDuplicates(a) {
    return a.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    })
}

/* Populate an array with a value, a set amount of times */
function fillArray(value, len) {
    var arr = [];
    for (var i = 0; i < len; i++) {
        arr.push(value);
    }
    return arr;
}

/* Add all of the values of an array into one numeric value */
function sumArray(array) {
    for (
        var
            index = 0,              // the iterator
            length = array.length,  // cache the array length
            sum = 0;                // the total amount
            index < length;         // the for-loop condition
            sum += array[index++]   // on each iteration
    );
    return sum;
}

/*
    Fallback function to be called in the event that the number
    of scores in the list provided to the performanceParse function
    is less than the number of grade buckets defined in the configuration.

    This can also be called as an stand alone function to parse a score list
    in a traditional score to grade manner.
*/
function traditionalParse(unsortedList) {
    var sortedList = sort(unsortedList);
    var parsedGrades = [];

    // Iterate through the list of scores
    for (index = 0; index < unsortedList.length; ++index) {

        // Verify we are dealing with a numerical value
        if (!isNumber(unsortedList[index])) {
            console.log("Numeric value not provided in grade list.");
            return false;
        }

        // Parse which grade the score associates to
        if (unsortedList[index] >= 90) {
            parsedGrades.push({
                score: unsortedList[index],
                grade: "A"
            });
        } else if (unsortedList[index] >= 80) {
            parsedGrades.push({
                score: unsortedList[index],
                grade: "B"
            });
        } else if (unsortedList[index] >= 70) {
            parsedGrades.push({
                score: unsortedList[index],
                grade: "C"
            });
        } else if (unsortedList[index] >= 60) {
            parsedGrades.push({
                score: unsortedList[index],
                grade: "D"
            });
        } else {
            parsedGrades.push({
                score: unsortedList[index],
                grade: "F"
            });
        }
    }

    return parsedGrades;
}

/*
    Primary function that takes a score list of any length as a parameter, and returns
    the list of grades associated with those scores. The "grades" that can be assigned
    to each even division of the score list can be defined in the configuration at the
    top of the file. The "bias" of the grade distribution can be configured as well, in
    the sense that when the grade bucks are calculated and rounding needs to occur, the
    scores will either lean towards the "higher" grade or the "lower" grade.

    Simply put: "Ceiling" configuration results in larger number of higher grades, while
    the "floor" configuration results in a larger number of lower grades.
*/
function performanceParse(unsortedList) {
    // Determine if performance or traditional grading would be more appropriate
    if (unsortedList.length() < config.buckets.length()) {
        console.log("Score list contains less than 5 values making a relative-performance
            based grade parsing system pointless. Reverting to a traditional parsing method.")
        return traditionalParse(unsortedList);
    }

    // Initialize our lists
    var sortedList = sort(unsortedList);                                    // Sort the list we are parsing
    var parsedGrades = [];                                                  // Initialize the parsed grades array to be returned
    var duplicateScores = sort(findDuplicates(sortedList));                 // Check for duplicates and store them if found, sort again just because
    if (duplicateScores.length > 0) { removeDuplicates(sortedList); }       // Now that they've been stored, remove them

    // Calculate at which points the score list will be broken
    var divNum = (floor(sortedList.length() / config.buckets.length()));    // Divide the number of items by number of buckets, remove remainder
    var modNum = (sortedList.length % config.buckets.length());             // Determine the remainder of the previous division

    // Generate the buckets in which the scores will be placed
    var gradeBuckets = fillArray(divNum, config.buckets.length());          // Should be equal to the number of buckets defined in configuration

    // Check bucket lengths
    if (gradeBuckets.length != config.buckets.length()) {
        console.log("Number of buckets generated is not the same as the number of buckets defined in
            the config. Continuing the algorithm will not accomplish the desired result. Exiting.")
        return;
    }

    /*
        In the event that the grade buckets don't split evenly (modulo doesn't result in 0)
        we need to determine how to distribute the extra scores evenly amongst the grade
        buckets in which a score may be placed. This is determined in the configuration.
    */
    if (modNum != 0) {
        /*
            For each extra number over 0 we have after modulo, increase the value of a
            bucket by 1 until we run out (from left to right)
        */
        for (index = 0; index < modNum; ++index) {
            gradeBuckets[index]++;
        }

        /*
            Two options here, to either be generous and distrubute the grades in the case of a
            score needing to be rounded between two grades so that it gets pushed up to the higher
            grade, or pushed down to the lower grade. Simply reversing the array distributes the grades
            on the D, F grade side of the bucket.
        */
        if (config.rounding == 'floor') {
            gradeBuckets.reverse();
            duplicateScores.reverse();
        }
    }

    /*
        Check if the sum of all the values in the gradeBucket array equals the original number
        of items in the unsortedList argument fed into the function. These two numbers should still
        be equal even if there are duplicates in the original unsortedArray due to the fact that they
        are removed from the sortedArray and placed into a separate array before bucket generation happens.
    */
    if (unsortedList.length != sumArray(gradeBuckets)) {
        console.log("There was an error calculating the size of each grade bucket.");
        return;
    }

    /*
        Initialize incrementing pointers that assist with assignment of scores to grades.
    */
    var bucketPointer = 0;          // Determines current bucket you are traversing over
    var bucketCounter = 0;          // Counter to determine how many scores to place in each bucket
    for (index = 0; index < sortedList.length; ++index) {

        /*
            If the counter exceeds the bucket max values to be assigned to it, then
            we need to move the pointer to the bucketPointer to the next bucket so
            we may assign this, and proceeding values to that bucket until this condition
            is once again met.
        */
        if (bucketCounter == gradeBuckets[bucketPointer]) {
            bucketPointer++;        // Increment bucketPointer
            bucketCounter = 0;      // Reset bucketCounter to zero
        }

        /*
            Checks if the current score being parsed exists within the duplicate score array. In
            the event that it does, add that value to the parsedGrades array with the same letter
            grade that the current score was set to receieve, and remove that value from the duplicateScore
            array. The reason this works is because the duplicateScores array is sorted in the same ascending
            or descending order that the sortedList is. A score in duplicateScores must also exist in sortedList.
        */
        while (sortedList[index] == duplicateScores[0]) {
            parsedGrades.push({
                score: sortedList[index],                   // The score we are parsing in the sortedList
                grade: config.buckets[bucketPointer]        // The letter value associated with the bucket we are within
            });

            duplicateScores.splice(0, 1);                   // Splice the score from the array as it's been pushed
        }

        /*
            After duplicates have been handled, and we've determined if we need to reset the counter and change the bucket
            we are assigning to...it's time to do the actual assignment of the score we are looking at in the sortedList.
        */
        parsedGrades.push({
            score: sortedList[index],                   // The score we are parsing in the sortedList
            grade: config.buckets[bucketPointer]        // The letter value associated with the bucket we are within
        });
    }

    return parsedGrades;
}