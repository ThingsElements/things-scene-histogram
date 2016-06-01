const ONEBYS2PI = 0.3989422804014327;

// 배열 최소 값
export function min(data) {
  return Math.min.apply(null, data)
}

// 배열 최대 값
export function max(data) {
  return Math.max.apply(null, data)
}

// 배열 평균
export function mean(data) {
  return grades.reduce(function (p, c) {
    return p + c;
  }) / grades.length
}

// 배열 표준편차(Standard deviation)
// 공식 - 배열 데이터 제곱의합 - (배열 사이즈(sample Size) * 배열 데이터 평균값의 제곱)
// / 배열 사이즈(sampleSize) - 1
export function stddev(data, mean) {
  if (!(data instanceof Array) || data.length < 1)
    throw new Error('Data should be instance of Array and have one or more than elements.');

  if (!mean) {
    mean = this.mean(data);
  }

  // Math.pow: 제곱 구하기(Ex) Math.pow(3,2) -> 3제곱(3의 2승)
  // Array.sum: 배열에 합계
  // Array.map: 함수 반환 값으로 새로운 Array 생성
  // var variance = Array.sum(Ext.Array.map(data, function(v) {
  //   return Math.pow(v - mean, 2);
  // })) / data.length;

  var variance = data.reduce((sum, d) => { return sum + Math.pow(d - mean, 2) }, 0) / data.length

  // Math.sqrt: 루트 근사 값
  return Math.sqrt(variance);
}

export function minunit(val) {
  if (val == 0)
    return 1;

  var temp = val;
  var minunit;

  if (Math.abs(temp) >= 1) {
    minunit = 0;
    while (true) {
      temp /= 10;
      if (Math.floor(temp) == 0) {
        temp = val;
        for ( var i = 1; i <= minunit; i++) {
          temp /= 10;
        }
        temp = Math.floor(temp) + 0.5;
        for ( var i = 1; i <= minunit; i++) {
          temp *= 10;
        }
        return {
          minunit : minunit,
          value : temp
        };
      } else {
        minunit++;
      }
    }
  } else {
    minunit = 1;
    while (true) {
      temp *= 10;
      if (Math.floor(temp) > 0) {
        temp = val;
        for ( var i = 1; i <= minunit; i++) {
          temp *= 10;
        }
        temp = Math.floor(temp) + 0.5;
        for ( var i = 1; i <= minunit; i++) {
          temp /= 10;
        }
        return {
          minunit : minunit,
          value : temp
        };
      } else {
        minunit++;
      }
    }
  }
}

export function dnormal(x, mu, sigma) {
  if (sigma <= 0)
    return null;

  var temp = (x - mu) * (x - mu) / (sigma * sigma);
  return ONEBYS2PI * Math.exp(-0.5 * temp);
}
