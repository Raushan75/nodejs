//module protecte their variables and functions from leaking
function calculateSum(a, b) {
    const sum = a + b;
    console.log(sum); // This line will never be executed because it's after the return statement
}

console.log(module.exports); // This will log the current module's exports empty object 

module.exports = {
    calculateSum
}; // Export the function to make it accessible in other files

// module.exports.x= x; // Exporting the variable x to make it accessible in other files
// module.exports.calculateSum = calculateSum; // Exporting the function calculateSum to make it accessible in other files