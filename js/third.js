console.log('Third.js');

// Test ES6
let a = [1, 2];
let b = [3, 4];
const arrowTest = (a, b) => {
  let c = [...a, ...b];
  console.log(c);
}
arrowTest(a, b);