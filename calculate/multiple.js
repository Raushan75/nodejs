function calculateMultiple(a, b) {
    const multiple = a * b;
    console.log(multiple); // This line will never be executed because it's after the return statement
}

module.exports = {
    calculateMultiple
}; // Export the function to make it accessible in other files