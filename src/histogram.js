import * as Stat from './stat'

var { Component, Rect } = scene

const CHART_BORDER_PIXELS = 10
const CHART_Y_SCALE_STEP = 5

export default class Histogram extends Rect {

  constructor(model, context) {
    super(model, context)

    this.min = null  // 데이터 배열 최소값
    this.max = null  // 데이터 배열 최대값
    this.mean = null   // 데이터 배열 평균
    this.stddev = null   // 표준편차
    this.freqData = []  // BAR 차트 배열 데이터
    this.binMesh = []  // X축 배열 데이터
    this.binfirst = null   // X축 처음값
    this.binlast = null  // X축 마지막값
    this.binwidth = null   // X축 간격(BAR 차트 넓이)
    this.binsize = null  // BAR 차트 생성 갯수
    this.calculated = false  //차트 기준값 계산 완료 상태(true : 완료, false: 미완료)

    this.initCalc()
    this.calculate()
  }

  get volatile() {
    return []
  }

  _draw(context) {
    var {
      value = 0,
      fillStyle,
      blankStrokeStyle,
      top,
      left,
      width,
      height,
      // 차트 데이타 리스트(valueList)
      data = [],

    // 차트 제목 설정
      topTitle = '',
      bottomTitle = '',
      leftTitle = '',

    // 차트 화면표시 설정
      show3SigmaLine = true,
      showNormalLine = true,
      showSpecLimit = true,
      showGridLine = true,
      showBarLabel = true,
      showSubXAxis = false,

      precision = 4,   // 차트 표시 소수점 자릿수

      autoScaleX = true,   // X축 최소값, 최대값 자동계산 여부(true : 자동, false : 설정)
      autoScaleY = true,   // Y축 최소값, 최대값 자동계산 여부(true : 자동, false : 설정)
      minX = 0,  // 사용자 정의 X축 최소값
      maxX = 100000,   // 사용자 정의 X축 최대값
      minY = 0,  // 사용자 정의 Y축 최소값
      maxY = 100, // 사용자 정의 Y축 최대값

      stepY = 0,   //Y축 max 최소값
    } = this.model;

    context.translate(left, top)

    context.beginPath()

    this.drawChart(context, width, height)

    context.closePath()

    context.translate(-left, -top)
  }

  get controls() {}

  // 차트 데이터 추가
  addValue(v) {
    this.model.data.push(v);

    this.initCalc()
    this.calculate()
  }

  // 차트 데이터 배열 추가
  setData(data) {
    this.model.data = data;

    this.initCalc()
    this.calculate()
  }

  // 차트 데이터 초기화
  resetData() {
    this.model.data = [];

    this.initCalc()
    this.calculate()
  }

  // 차트 데이터 갯수
  getDataCount() {
    return this.model.data.length;
  }

  // 차트 데이터 설정 초기화
  initCalc() {
    this.binMesh = [];
    this.freqData = [];
    this.min = null;
    this.max = null;
    this.stddev = null;
    this.mean = null;
    this.binfirst = null;
    this.binlast = null;
    this.binwidth = null;
    this.binsize = null;
    this.calculated = false;
  }

  // 차트 데이터 계산
  calculate() {
    var { data } = this.model

    if (data.length < 2)
      return false;

    if(!Number(data[0]))
      return false;

    this.min = Stat.min(data);
    this.max = Stat.max(data);

    var range = this.max - this.min;

    // BAR 차트 갯수 설정(초기 설정값이 있으면 계산X)
    if (this.binsize === null) {
      // Math.sqrt(루트 근사값), Math.floor(소수점 올림)
      var bin = Math.floor(Math.sqrt(data.length));
      bin = Math.max(5, bin);
      bin = Math.min(20, bin);
      this.binsize = bin;
    }

    // BAR 차트 넓이 지정
    var o = Stat.minunit(range / this.binsize);
    this.binwidth = o.value;
    var minunit = o.minunit;
    // X축 처음값, 마지막값 설정
    if (range == 0) {
      this.binsize = 5;
      this.binfirst = Math.floor(this.min) - 2;
      this.binlast = Math.floor(this.min) + 3;
    } else {
      var temp = this.min;

      if (Math.abs(this.binwidth) >= 1) {
        for ( var i = 1; i <= minunit; i++) {
          temp /= 10;
        }
        temp = Math.floor(temp) - 0.5;
        for ( var i = 1; i <= minunit; i++) {
          temp *= 10;
        }
        this.binfirst = temp;
      } else {
        for ( var i = 1; i <= minunit; i++) {
          temp *= 10;
        }
        temp = Math.floor(temp) - 0.5;
        for ( var i = 1; i <= minunit; i++) {
          temp /= 10;
        }
        this.binfirst = temp;
      }

      this.binlast = this.binfirst + this.binwidth * this.binsize;
      while (this.binlast - this.max <= 0.00000000000001) {
        this.binlast += this.binwidth;
        this.binsize += 1;
      }
    }

    // X 축 배열 생성, BAR 차트 데이터 초기 배열 생성
    for ( var i = 0; i <= this.binsize; i++) {
      this.freqData.push(0);
      this.binMesh.push(this.binfirst + this.binwidth * i);
    }

    // BAR 차트 데이터 배열 값 설정
    var sum = 0, idx, dv;
    for ( var i = 0; i < data.length; i++) {
      dv = data[i];
      sum += dv;

      if (dv === this.binfirst) {
        idx = 0;
      } else {
        idx = Math.floor((dv - this.binfirst) / this.binwidth)
      }

      this.freqData[idx]++;
    }

    if (range !== 0) {
      while (this.freqData.length > 0) {
        if (this.freqData[0] !== 0)
          break;

        this.freqData.shift();
        this.binfirst += this.binwidth;
        this.binMesh.shift();
        this.binlast -= this.binwidth;
        this.binsize -= 1;
      }
    }

    // 데이터 배열 평균 계산 및 설정(초기 설정값이 있으면 계산X)
    if (this.mean === null) {
      this.mean = sum / data.length;
    }

    // 데이터 배열 표준 편차 계산
    if (this.stddev === null) {
      this.stddev = Stat.stddev(data, this.mean);
    }

    this.calculated = true;
  }

  onchange(after) {
    // TODO data등 계산로직과 관련된 부분의 변경이 있을 때 다시 계산하도록 한다.
    // this.initCalc()
    // this.calculate()
  }

  // 차트 그리기(전체 화면 다시그림)
  // * 화면을 각각 개별로 다시 그리고 싶다면 그린 element를 변수로 저장하고 remove 함수로 삭제
  drawChart(context, width, height) {

    var {
      data,
      showNormalLine,
      showSpecLimit,
      show3SigmaLine
    } = this.model

    // 데이타 배열 체크
    if (data.length < 2 || !Number(width) || !Number(height) )
      return false;


    // 차트 초기화

    this.drawTitle(context, width, height);
    var rect = this.getRect(width, height);

    this.drawXAxis(context, rect);
    this.drawYAxis(context, rect);
    this.drawBar(context, rect);
    this.drawRegion(context, rect);

    if (showNormalLine === true) {
      this.drawNormalLine(context, rect);
    }
    if (show3SigmaLine === true) {
      this.draw3SLine(context, rect);
    }
    if (showSpecLimit === true) {
      this.drawSpecLine(context, rect);
    }
  }

  getRect(w, h){
    var CHART_LEFT_GAP_PIXELS = 60;
    var CHART_RIGHT_GAP_PIXELS = 30;
    var CHART_TOP_GAP_PIXELS = 50;
    var CHART_BOTTOM_GAP_PIXELS = 90;

    var rect = {
      x : CHART_LEFT_GAP_PIXELS,
      y : CHART_TOP_GAP_PIXELS,
      w : w - CHART_LEFT_GAP_PIXELS - CHART_RIGHT_GAP_PIXELS,
      h : h - CHART_TOP_GAP_PIXELS - CHART_BOTTOM_GAP_PIXELS
    };
    return rect;
  }

  // 차트 제목 그리기
  drawTitle(context, w, h) {
    var {
      topTitle = '',
      bottomTitle = '',
      leftTitle = ''
    } = this.model

    var rect = {
      x : CHART_BORDER_PIXELS, // x좌표
      y : CHART_BORDER_PIXELS, // y좌표
      w : w - 2 * CHART_BORDER_PIXELS, // 넓이
      h : h - 2 * CHART_BORDER_PIXELS // 높이
    };

    // TODO 디자인: 차트에 top, left, bottom 문자
    context.fillStyle = '#315A9D'
    context.textAlign = 'center'
    context.font = 'bold 13px Verdana'
    context.beginPath()

    if (topTitle){
      context.fillText(topTitle, rect.x + rect.w / 2, rect.y)
    }
    if (bottomTitle){
      context.fillText(bottomTitle, rect.x + rect.w / 2, rect.y + rect.h - 2)
    }
    if (leftTitle){
      context.translate(rect.x + 5, rect.y + rect.h / 2)
      context.rotate(-Math.PI / 2)
      context.fillText(leftTitle, 0, 0)
      context.rotate(Math.PI / 2)
      context.translate(-(rect.x + 5), -(rect.y + rect.h / 2))
    }
  }
  // 차트 사각형 영역 그리기
  drawRegion(context, rect) {
    // TODO 디자인: 차트 사각형 영역
    context.strokeStyle = '#666'
    context.lineWidth = 1
    context.rect(rect.x, rect.y, rect.w, rect.h)
  }

  // 차트 X축 그리기
  drawXAxis(context, r) {
    var { autoScaleX, show3SigmaLine, showSpecLimit, showSubXAxis, precision, minX, maxX, target, lsl, usl } = this.model
    var min, max, xpos, ypos;
    var textHeight = 15;

    if (autoScaleX) {
      // this.binMesh, mean, target, usl, lsl 데이터로 최소값, 최대값 생성하여 설정
      min = this.binMesh[0];
      max = this.binMesh[this.binMesh.length - 1];

      var vs = [ min, max ];

      if (show3SigmaLine) {
        vs.push(this.mean - this.stddev * 3);
        vs.push(this.mean + this.stddev * 3);
      }

      if (showSpecLimit) {
        vs.push(target);
        vs.push(lsl);
        vs.push(usl);
      }

      min = Math.min.apply(null, vs);
      max = Math.max.apply(null, vs);
    } else {
      // 설정한 최소값, 최대값 설정
      min = minX;
      max = maxX;
    }

    var maxTextSize = 0; // X축 문자 최대 넓이
    var prevXPos = 0; // 전 X축 X좌표
    var passCount = 0; // x축 출력 제외 순번
    var iCount = 0; // X축 출력 갯수

    ypos = r.y + r.h;

    // 글자 스타일 지정
    context.beginPath()

    context.font = '10px Verdana'
    context.textAlign = 'center'
    context.strokeStyle = '#666'
    context.fillStyle = '#666'
    context.lineWidth = 1

    // X축 문자 최대 가로 넓이 계산
    for ( var i = 0; i < this.binMesh.length; i++) {
      xpos = r.x + ((this.binMesh[i] - this._minX) * r.w) / (max - min);
      var text = '';
      if(!!Number(this.binMesh[i])){
        text = this.binMesh[i].toFixed(precision);
      }

      context.fillText(text, xpos, ypos + 10)
    }

    // X축 passCount 계산
    for ( var i = 0; i < this.binMesh.length; i++) {
      xpos = r.x + ((this.binMesh[i] - min) * r.w) / (max - min);
      if (i > 0) {
        if (xpos - prevXPos > maxTextSize + 5) {
          break;
        }
      }
      if (i == 0) {
        prevXPos = xpos;
      }
      passCount++;
    }

    // rect 하단에 X축 출력
    for ( var i = 0; i < this.binMesh.length; i++) {
      xpos = r.x + ((this.binMesh[i] - min) * r.w) / (max - min);
      // passCount에 따른 X축 출력
      if (iCount % passCount == 0) {
        // X축 라인, 문자
        context.moveTo(xpos, ypos + 5)
        context.lineTo(xpos, ypos)
        context.stroke()

        var text = '';
        if(!!Number(this.binMesh[i])){
          text = this.binMesh[i].toFixed(precision);
        }
        context.fillText(text, xpos, ypos + 14)
      }
      iCount++;
    }

    // 3SigmaLine, SpecLimit에 따른 보조 x축 ypos 설정
    if (this.show3SigmaLine && this.showSpecLimit) {
      ypos = r.y + r.h + 8 + textHeight * 3;
    } else if (!this.showSpecLimit && this.show3SigmaLine) {
      ypos = r.y + r.h + 8 + textHeight * 2;
    } else if (this.showSpecLimit && !this.show3SigmaLine) {
      ypos = r.y + r.h + 8 + textHeight * 2;
    } else {
      ypos = r.y + r.h + 8 + textHeight * 1;
    }

    if(showSubXAxis){
      // rect 하단에 보조 X축 라인출력
      context.moveTo(r.x - 20, ypos)
      context.lineTo(r.x + r.w + 20, ypos)
      context.stroke()


      var szstep = (max - min) / CHART_Y_SCALE_STEP;

      // rect 하단에 보조 X축 출력
      for ( var i = 0; i <= CHART_Y_SCALE_STEP; i++) {
        var v = min + szstep * i;
        var xpos = r.x + ((v - min) * r.w) / (max - min);

        // TODO 디자인: 보조 X축 Line와 문자
        context.moveTo(xpos, ypos + 5)
        context.lineTo(xpos, ypos)
        context.stroke()

        var text = '';
        if(!!Number(v)){
          text = v.toFixed(precision);
        }
        context.fillText(text, xpos, ypos + 14)
      }
    }
  }

  // 차트 Y축 그리기
  drawYAxis(context, r) {
    var min = 0, max, ypos, szstep, yinterval;
    var { minY, maxY, stepY, autoScaleY, showGridLine, alpha = 1} = this.model

    //BAR 차트 값에 max 값을 계산
    max = Math.floor(Math.max.apply(null, this.freqData));

    if (autoScaleY) {
      max += 5;
      max = max - max % 5;
    } else {
      min = minY;
      max = maxY;
    }

    if (max < stepY)
      max = stepY;

    maxY = max;

    if (stepY > 0) {
      yinterval = stepY;
      szstep = Math.floor((max - min) / yinterval);
    } else {
      if (max < 10) {
        szstep = max;
      } else {
        szstep = CHART_Y_SCALE_STEP;
      }

      if (szstep === 0) {
        szstep = CHART_Y_SCALE_STEP;
      }

      yinterval = (max - min) / szstep;
    }

    context.font = '10px Verdana'
    context.textBaseline = 'end'
    context.fillStyle = '#666'
    context.strokeStyle = '#666'
    context.lineWidth = 1

    for ( var i = 0; i <= szstep; i++) {
      var v = min + yinterval * i;
      ypos = (r.y + r.h) - ((v - min) * r.h) / (max - min);

      // TODO 디자인: Y축 문자, 라인
      context.beginPath()
      context.globalAlpha = alpha

      context.moveTo(r.x - 5, ypos)
      context.lineTo(r.x, ypos)
      context.stroke()

      context.fillText(v, r.x - 10, ypos)

      // TODO 디자인: 그리드 라인
      if (showGridLine) {
        context.beginPath()
        context.globalAlpha = 0.2 * alpha
        context.moveTo(r.x + 1, ypos)
        context.lineTo(r.x + r.w, ypos)
        context.stroke()
      }
    }
    context.globalAlpha = alpha
  }

  // BAR 차트 그리기
  drawBar(context, r) {
    var yl, xp1, xp2, hp, yp;
    var { minX, maxX, minY, maxY, showBarLabel } = this.model

    for ( var i = 0; i < this.binMesh.length - 1; i++) {
      yl = this.freqData[i];
      xp1 = r.x + ((this.binMesh[i] - minX) * r.w) / (maxX - minX); // x
      // pixels
      xp2 = r.x + ((this.binMesh[i + 1] - minX) * r.w) / (maxX - minX);
      hp = (yl - minY) * r.h / (maxY - minY); // height
      // pixels

      yp = r.y + r.h - hp;

      // TODO 디자인: BAR차트 막대
      if (hp > 0) {
        context.beginPath()

        context.fillStyle = '#86c838'
        context.rect(xp1 + 2, yp, xp2 - xp1 - 4, hp)
        context.fill()
      }

      // TODO 디자인: BAR차트 막대위 문자
      if (showBarLabel) {
        context.beginPath()

        yp = Math.min(yp + hp / 2, r.y + r.h - 20);

        context.font = '10px Verdana'
        context.textAlign = 'center'
        context.fillStyle = '#ff0000'

        context.fillText(this.freqData[i], (xp1 + xp2) / 2, yp)
      }
    }
  }

  // Line 차트 그리기
  drawNormalLine(context, r) {

    var { maxX, minX, alpha = 1 } = this.model
    var min = r.x;
    var max = r.x + r.w;

    // TODO 디자인: 라인 차트 라인, 라인 배경

    context.beginPath()

    context.strokeStyle = '#017ed5'
    context.fillStyle = '#abd7f9'
    context.lineWidth = 1
    context.globalAlpha = 0.4 * alpha

    for ( var i = min + 1; i <= max; i++) {
      var x = (i - min) * (maxX - minX) / r.w + minX;

      var dnormal = Stat.dnormal(x, this.mean, this.stddev);

      var y = dnormal;
      dnormal = Stat.dnormal(this.mean, this.mean, this.stddev);

      var ypos = (r.y + r.h) - (y * r.h / dnormal);

      if (ypos > (r.y + r.h))
        continue;

      if(i == min)
        context.moveTo(i, Math.floor(ypos))
      else
        context.lineTo(i, Math.floor(ypos))
    }

    context.stroke()
    context.fill()

    context.globalAlpha = alpha

  }

  // Mean, 3Sigma Line 그리기
  draw3SLine(context, r) {
    /* Mean Line 그리기 */
    var { minX, maxX, showSpecLimit, precision } = this.model
    var origin = {
      x : r.x,
      y : r.y + r.h
    };
    var min = minX, max = maxX;

    var xpos = origin.x + (((this.mean - min) * r.w) / (max - min));
    var ypos = origin.y;

    //TODO 디자인: 문자(M)
    context.beginPath()

    context.font = '12px Verdana'
    context.textAlign = 'center'
    context.fillStyle = '#da5165'
    context.strokeStyle = '#da5165'
    context.lineWidth = 1

    if (xpos > r.x - 20 && xpos < (r.x + r.w) + 20) {

      context.moveTo(xpos, ypos)
      context.lineTo(xpos, ypos - r.h - 10)
      context.stroke()

      context.fillText('M', xpos, ypos - r.h - 15)
    }

    var textHeight = 20;

    if (showSpecLimit) {
      var text = '';
      if(!!Number(this.mean)){
        text = this.mean.toFixed(precision);
      }
      context.font = '10px Verdana'
      context.fillText(text, xpos, ypos + textHeight * 2)
    } else {
      var text = '';
      if(!!Number(this.mean)){
        text = this.mean.toFixed(precision);
      }
      context.font = '10px Verdana'
      context.fillText(text, xpos, ypos + textHeight)
    }

    if (this.stddev == 0)
      return;

    /* 3Sigma Line 그리기 */

    var l3sigma = this.mean - this.stddev * 3;
    var u3sigma = this.mean + this.stddev * 3;

    xpos = origin.x + (((l3sigma - min) * r.w) / (max - min));

    //TODO 디자인: 문자(-3s)
    if (xpos > r.x - 20 && xpos < (r.x + r.w) + 20) {

      context.beginPath()

      context.strokeStyle = '#da5165'
      context.lineWidth = 1
      context.moveTo(xpos, ypos)
      context.lineTo(xpos, ypos - r.h - 10)
      context.stroke()

      context.font = '12px Verdana'
      context.fillText('-3s', xpos, ypos - r.h - 15)
    }

    if (showSpecLimit) {
      var text = '';
      if(!!Number(l3sigma)){
        text = l3sigma.toFixed(precision);
      }
      context.font = '10px Verdana'
      context.fillText(text, xpos, ypos + textHeight * 2)
    } else {
      var text = '';
      if(!!Number(l3sigma)){
        text = l3sigma.toFixed(precision);
      }
      context.font = '10px Verdana'
      context.fillText(text, xpos, ypos + textHeight)
    }

    xpos = origin.x + (((u3sigma - min) * r.w) / (max - min));

    //TODO 디자인: 문자(3s)
    if (xpos > r.x - 20 && xpos < (r.x + r.w) + 20) {

      context.beginPath()
      context.strokeStyle = '#da5165'
      context.lineWidth = 1
      context.moveTo(xpos, ypos)
      context.lineTo(xpos, ypos - r.h - 10)
      context.stroke()

      context.font = '12px Verdana'
      context.fillText('3s', xpos, ypos - r.h - 15)
    }

    if (showSpecLimit) {
      var text = '';
      if(!!Number(u3sigma)){
        text = u3sigma.toFixed(precision);
      }
      context.font = '10px Verdana'
      context.fillText(text, xpos, ypos + textHeight * 2)
    } else {
      var text = '';
      if(!!Number(u3sigma)){
        text = u3sigma.toFixed(precision);
      }
      context.font = '10px Verdana'
      context.fillText(text, xpos, ypos + textHeight)
    }
  }

  // Target, Spec Line 그리기
  drawSpecLine(context, r) {
    /* Target Line 그리기 */
    var { minX, maxX, precision, target, lsl, usl } = this.model
    var origin = {
      x : r.x,
      y : r.y + r.h
    };
    var min = minX, max = maxX;

    var xpos = origin.x + (((target - min) * r.w) / (max - min));
    var ypos = origin.y;

    //TODO 디자인: 문자(T)
    context.beginPath()

    context.font = '10px Verdana'
    context.textAlign = 'center'
    context.fillStyle = '#ffa500'
    context.strokeStyle = '#ffa500'
    context.lineWidth = 1

    if (xpos > r.x - 20 && xpos < (r.x + r.w) + 20) {

      context.moveTo(xpos, ypos)
      context.lineTo(xpos, ypos - r.h)
      context.stroke()

      context.font = '11px Verdana'
      context.fillText('T', xpos, ypos - r.h - 5)
    }

    var textHeight = 25;

    var text = '';
    if(!!Number(target)){
      text = target.toFixed(precision);
    }
    context.font = '10px Verdana'
    context.fillText(text, xpos, ypos + textHeight)

    if (this.stddev == 0)
      return;

    /* Spec Line 그리기 */

    xpos = origin.x + (((lsl - min) * r.w) / (max - min));

    if (xpos > r.x - 20 && xpos < (r.x + r.w) + 20) {

      context.moveTo(xpos, ypos)
      context.lineTo(xpos, ypos - r.h)
      context.stroke()

      context.font = '11px Verdana'
      context.fillText('LSL', xpos, ypos - r.h - 5)
    }
    var text = '';
    if(!!Number(lsl)){
      text = lsl.toFixed(precision);
    }

    context.font = '10px Verdana'
    context.fillText(text, xpos, ypos + textHeight)

    xpos = origin.x + (((usl - min) * r.w) / (max - min));

    if (xpos > r.x - 20 && xpos < (r.x + r.w) + 20) {

      context.moveTo(xpos, ypos)
      context.lineTo(xpos, ypos - r.h)
      context.stroke()

      context.font = '11px Verdana'
      context.fillText('USL', xpos, ypos - r.h - 5)
    }
    if(!!Number(usl)){
      text = usl.toFixed(precision);
    }

    context.font = '10px Verdana'
    context.fillText(text, xpos, ypos + textHeight)
  }
}

Component.register('histogram', Histogram)
