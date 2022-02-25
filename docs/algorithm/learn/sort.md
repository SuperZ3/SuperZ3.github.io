# 排序

## 冒泡排序

相邻项两两比较，每轮循环将一个较大的数逐步移到最上面。
```javascript
  function bubble(arr) {
    const len = arr.length;
    for(let i = 0; i < len; i++ ) {
      for(let j = 0; j < len - i; j++ ) {
        const current = arr[j];
        const next = arr[j + 1];
        if(current > next){
          arr[j] = next;
          arr[j + 1] = current;
        }
        continue;
      }
    }
    return arr
  }
```
## 选择排序

找到最小值放到第一位，找到第二小值放在第二位，以此类推。
```javascript
  function selectionSort(arr, compareFn = compare) {
    const { length } = arr;
    let indexMixin;
    for ( let i = 0; i < length - 1; i++ ) {
      indexMixin = i;
      for ( let j = i; j < length; j++ ) {
        if (arr[j] < arr[indexMixin]) {
          indexMixin = j;
        }
      }
      
      if ( i !== indexMixin) {
        [arr[indexMixin], arr[i]] = [arr[i], arr[indexMixin]]
      }
    }
  }
```
## 插入排序
假定第一项已经排好，接着看后面的项排到它前面还是后面
```javascript
  function insertionSort(arr, compareFn = compare) {
    for (let i = 1; i < arr.length; i++) {
      let j = i;
      let temp = arr[i];
      while (j > 0 && arr[j - 1] > temp) {
        arr[j] = arr[j - 1];
        j--;
      }
      arr[j] = temp;
    }
    return arr;
  }
```
## 归并排序
将大数组逐步分为小数组，直到每个小数组只有一个元素，并将小数组归并为大数组。
```javascript
  function mergeSort(arr) {
    const len = arr.length;
    if (len > 1) {
      const middle = Math.floor(len / 2);
      const left = mergeSort(arr.slice(0, middle));
      const right = mergeSort(arr.slice(middle));
      arr = merge(left, right);
    }
    return arr;
  }

  function merge(left, right) {
    let i = 0;
    let j = 0;
    const result = [];
    const leftLen = left.length;
    const rightLen = right.length;
    while( i < leftLen && j < rightLen) {
      result.push(
        left[i] < right[j] ? left[i++] : right[j++]
      )
    }

    return result.concat(i < leftLen ? left.slice(i) : right.slice(j));
  }
```
## 快速排序
选择主元，将比主元小的都移到它左边，比主元大的都移到右边，再对两个数组分别执行同一操作
```javascript
  function quickSort(arr) {
    return quick(arr, 0, arr.length - 1);
  }

  function quick(arr, left, right) {
    const { length } = arr;
    let index;
    if (length > 1) {
      index = partition(arr, left, right);
      if (left < index - 1){
        quick(arr, left, index - 1);
      }
      if (right > index) {
        quick(arr, index, right);
      }
    }
    return arr;
  }

  function partition(arr, left, right) {
    const middle = arr[Math.floor((left + right) / 2)];
    let i = left;
    let j = right;
    while(i <= j) {
      while(arr[i] < middle) {
        i++
      }
      
      while(middle < arr[j]) {
        j--
      }
      
      if (i <= j) {
        [arr[j], arr[i]] = [arr[i], arr[j]];
        i++;
        j--;
      }
      return i
    }
  }
```
## 计数排序
适用整数排序，利用计数数组，将原数组元素转换为计数数组下标，再将计数数组还原成排好的数组
```javascript
  function countSort(arr) {
    const { length } = arr;
    if (length < 2) {
      return arr;
    }
    let maxValue = arr[0];
    arr.forEach(e => {
      if (e > max) {
        maxValue = e
      }
    });
    
    const counts = new Array(maxValue + 1);
    arr.forEach(num => {
      if (!counts[num]) {
        counts[num] = 0;
      }
      counts[num]++;
    })
    
    let sortIndex = 0;
    counts.forEach((count, index) => {
      while(count > 0) {
        arr[sortIndex++] = index;
        count--;
      }
    });
    return arr
  }
```