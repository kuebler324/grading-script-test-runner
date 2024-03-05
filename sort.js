function selectionSort(arr) {
  for (let i = 0; i < arr.length; ++i) {
    let min = arr[i];
    let minIndex = i;
    for (let j = i + 1; j < arr.length; ++j) {
      if (arr[j] < min) {
        min = arr[j];
        minIndex = j;
      }
    }
    // swap
    arr[minIndex] = arr[i];
    arr[i] = min;
  }
}
function insertionSort(arr) {
  for (let i = 1; i < arr.length; ++i) {
    const x = arr[i];
    let j;
    for (j = i - 1; j >= 0; --j) {
      if (x < arr[j]) {
        arr[j + 1] = arr[j];
      } else {
        break;
      }
    }
    arr[j + 1] = x;
  }
}
function bubbleSort(arr) {
  for (let i = arr.length - 1; i >= 0; --i) {
    let t = false;
    for (let j = 0; j < i; ++j) {
      const x = arr[j];
      if (x > arr[j + 1]) {
        arr[j] = arr[j + 1];
        arr[j + 1] = x;
        t = true;
      }
    }
    if (!t) {
      break;
    }
  }
}
function shellSort(arr, hValues) {
  hValues.forEach(h => {
    for (let i = 0; i < arr.length; ++i) {
      const x = arr[i];
      let j;
      for (j = i - h; j >= 0; j -= h) {
        if (x < arr[j]) {
          arr[j + h] = arr[j];
        } else {
          break;
        }
      }
      arr[j + h] = x;
    }
  });
}
function heapSort(arr) {
  // not implementing a heap for this
}
function mergeSortHelper(l1, l2) {
  console.log(l1, l2);
  const arrOut = [];
  let p1 = 0;
  let p2 = 0;
  while (p1 !== l1.length && p2 !== l2.length) {
    if (l1[p1] < l2[p2]) {
      arrOut.push(l1[p1]);
      p1 += 1;
    } else {
      arrOut.push(l2[p2]);
      p2 += 1;
    }
  }
  while (p1 !== l1.length) {
    arrOut.push(l1[p1]);
    p1 += 1;
  }
  while (p2 !== l2.length) {
    arrOut.push(l2[p2]);
    p2 += 1;
  }
  return arrOut;
}
function mergeSort(arr) {
  if (arr.length <= 1) {
    return arr;
  }
  // create l1
  const l1 = [];
  const half = Math.floor(arr.length / 2);
  for (let i = 0; i < half; ++i) {
    l1.push(arr[i]);
  }
  // create l2
  const l2 = [];
  for (let i = half; i < arr.length; ++i) {
    l2.push(arr[i]);
  }
  return mergeSortHelper(mergeSort(l1), mergeSort(l2));
}
function quickSort(arr) {
  // see assignment 1, I'm not figuring that out again
}
function bindex(value) {
  return {
    a: 0,
    b: 1,
    c: 2,
    d: 3,
  }[value];
}
function bucketSort(arr, k) {
  // generate bindex map
  const c = new Array(k + 1);
  c.fill(0);
  for (let i = 0; i < arr.length; ++i) {
    c[bindex(arr[i]) + 1] += 1;
  }
  for (let i = 2; i < c.length; ++i) {
    c[i] += c[i - 1];
  }
  const arrOut = new Array(arr.length);
  for (let i = 0; i < arr.length; ++i) {
    const bucketIndex = bindex(arr[i]);
    const index = c[bucketIndex];
    arrOut[index] = arr[i];
    c[bucketIndex] += 1;
  }
  return arrOut;
}

const array = [3, 8, 9, 5, 2, 1, 4, 7, 6];
const bucketExample = ['a', 'c', 'b', 'b', 'd', 'a'];
console.log(bucketSort(bucketExample, 4));
