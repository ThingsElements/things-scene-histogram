import Stat from './stat'

var { Component, Rect } = scene

const CHART_BORDER_PIXELS = 10

export default class Histogam extends Rect {

  constructor(model, context) {
    super(model, context)

  // 차트 데이타 리스트(valueList)
    this.data = []  

  // 차트 제목 설정
    this.topTitle = ''  
    this.bottomTitle = '' 
    this.leftTitle = '' 

  // 차트 화면표시 설정
    this.show3SigmaLine = true  
    this.showNormalLine = true  
    this.showSpecLimit = true 
    this.showGridLine = true  
    this.showBarLabel = true  

  // 차트 테이터 기준값 설정
    this.usl = null  // Upper Specification Limit
    this.target = null   
    this.lsl = null  // Lower Specification Limit
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

  // 차트 색상 설정
    this.bgColor = null  // Color.WhiteSmoke
    this.barColor = null   // Color.FromArgb(81, 121, 214)

    this.precision = 4   // 차트 표시 소수점 자릿수

    this.autoScaleX = true   // X축 최소값, 최대값 자동계산 여부(true : 자동, false : 설정)
    this.autoScaleY = true   // Y축 최소값, 최대값 자동계산 여부(true : 자동, false : 설정)
    this.minX = 0  // 사용자 정의 X축 최소값
    this.maxX = 100000   // 사용자 정의 X축 최대값
    this.minY = 0  // 사용자 정의 Y축 최소값
    this.maxY = 100 // 사용자 정의 Y축 최대값

    this.stepY = 0   //Y축 max 최소값
  }

  _draw(context) {
    var {
      value = 0,
      hidden = false,
      fillStyle,
      blankStrokeStyle,
      top,
      left,
      width,
      height
    } = this.model;

    if(!hidden){

      context.translate(left, top)

      context.beginPath()

      drawChart(context, width, height)

      context.closePath()

      this.drawFill(context)
      this.drawStroke(context)
      
      context.translate(-left, -top)
    }
  }

  get controls() {}

  // 차트 데이터 추가
  addValue(v) {
    this.data.push(v);
  }

  // 차트 데이터 배열 추가
  setData(data) {
    this.data = data;
  }

  // 차트 데이터 초기화
  resetData() {
    this.data = [];
  }

  // 차트 데이터 갯수
  getDataCount() {
    return this.data.length;
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
    if (this.data.length < 2)
      return false;

    if(!Number(this.data[0]))
      return false;
    
    this.min = Stat.min(this.data);
    this.max = Stat.max(this.data);

    var range = this.max - this.min;

    // BAR 차트 갯수 설정(초기 설정값이 있으면 계산X)
    if (this.binsize === null) {
      // Math.sqrt(루트 근사값), Math.floor(소수점 올림)
      var bin = Math.floor(Math.sqrt(this.data.length));
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
    for ( var i = 0; i < this.data.length; i++) {
      dv = this.data[i];
      sum += dv;

      if (dv === this.binfirst) {
        idx = 0;
      } else {
        idx = Math.floor(Math.floor((dv - this.binfirst) / this.binwidth));
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
      this.mean = sum / this.data.length;
    }

    // 데이터 배열 표준 편차 계산
    if (this.stddev === null) {
      this.stddev = Stat.stddev(this.data, this.mean);
    }

    this.calculated = true;
  }

  // 차트 그리기(전체 화면 다시그림)
  // * 화면을 각각 개별로 다시 그리고 싶다면 그린 element를 변수로 저장하고 remove 함수로 삭제
  drawChart(w, h) {
    var width = w || this.curWidth;
    var height = h || this.curHeight;

    // 데이타 배열 체크
    if (this.data.length < 2 || !Number(width) || !Number(height) )
      return false;

    // 차트 초기화 
    
    this.drawTitle(width, height);
    
    var rect = this.getRect(width, height);
    this.drawXAxis(rect);
    this.drawYAxis(rect);
    this.drawBar(rect);
    this.drawRegion(rect);
    if (this.showNormalLine === true) {
      this.drawNormalLine(rect);
    }

    if (this.show3SigmaLine === true) {
      this.draw3SLine(rect);
    }

    if (this.showSpecLimit === true) {
      this.drawSpecLine(rect);
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
    var textattr = {
      type : 'text',
      'fill' : '#315A9D',
      'font-size' : '13px',
      'font-family' : 'Verdana',
      'text-anchor' : 'middle',
      'font-weight' : 'bold'
    };
    
    if (topTitle){
      var attr = Object.assign({
        text : topTitle,
        x : rect.x + rect.w / 2,
        y : rect.y
      }, textattr);
      this.surface.add(attr).show(true);

      context.fillStyle = '#315A9D'
      context.font....

      context.drawText(....)
    }
    if (bottomTitle){
      var attr = Object.assign({
        text : bottomTitle,
        x : rect.x + rect.w / 2,
        y : rect.y + rect.h - 2
      }, textattr);
      var sprite = this.surface.add(attr);
      sprite.show(true);
    }
    if (leftTitle){
      var attr = Object.assign({
        text : leftTitle,
        x : rect.x + 5,
        y : rect.y + rect.h / 2,
        rotate : {
          degrees : -90
        }
      }, textattr);
      this.surface.add(attr).show(true);
    }
  }
  // 차트 사각형 영역 그리기
  drawRegion(rect) {
    // TODO 디자인: 차트 사각형 영역
    this.surface.add({
      type : 'rect',
      x : rect.x,
      y : rect.y,
      width : rect.w,
      height : rect.h,
      'stroke' : '#666',
      'stroke-width' : 1
    }).show(true);
  }

  // 차트 X축 그리기
  drawXAxis(r) {
    var CHART_Y_SCALE_STEP = 5;

    var min, max, xpos, ypos;
    var textHeight = 15;

    if (this.autoScaleX) {
      // binMesh, mean, target, usl, lsl 데이터로 최소값, 최대값 생성하여 설정
      min = this.binMesh[0];
      max = this.binMesh[this.binMesh.length - 1];

      var vs = [ min, max ];

      if (this.show3SigmaLine) {
        vs.push(this.mean - this.stddev * 3);
        vs.push(this.mean + this.stddev * 3);
      }

      if (this.showSpecLimit) {
        vs.push(this.target);
        vs.push(this.lsl);
        vs.push(this.usl);
      }

      min = Math.min.apply(null, vs);
      max = Math.max.apply(null, vs);
    } else {
      // 설정한 최소값, 최대값 설정
      min = this.minX;
      max = this.maxX;
    }

    this.minX = min;
    this.maxX = max;

    var path; // Line 출력 좌표
    var maxTextSize = 0; // X축 문자 최대 넓이
    var prevXPos = 0; // 전 X축 X좌표
    var passCount = 0; // x축 출력 제외 순번
    var iCount = 0; // X축 출력 갯수

    ypos = r.y + r.h;

    // X축 문자 최대 가로 넓이 계산
    for ( var i = 0; i < this.binMesh.length; i++) {
      xpos = r.x + ((this.binMesh[i] - min) * r.w) / (max - min);
      var text = '';
      if(!!Number(this.binMesh[i])){
        text = this.binMesh[i].toFixed(this.precision);
      }
      var t = this.surface.add({
        type : 'text',
        'text-anchor' : 'middle',
        'font-size' : '10px',
        'font-family' : 'Verdana',
        text : text,
        x : xpos,
        y : ypos + 10
      }).show(true);
      
      var tBox = t.getBBox();
      maxTextSize = Math.max(maxTextSize, tBox.width);
      t.remove();
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
        path = 'M' + xpos + ',' + (ypos + 5) + 'L' + xpos + ',' + ypos;
        // TODO 디자인: 보조 X축 Line와 문자
        this.surface.add({
          type : 'path',
          path : path,
          'stroke' : '#666'   
        }).show(true);
        var text = '';
        if(!!Number(this.binMesh[i])){
          text = this.binMesh[i].toFixed(this.precision);
        }
        this.surface.add({
          type : 'text',
          'fill' : '#666',
          'text-anchor' : 'middle',
          'font-size' : '10px',
          'font-family' : 'Verdana',
          text : text,
          x : xpos,
          y : ypos + 10
        }).show(true);
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

    // rect 하단에 보조 X축 라인출력
    path = 'M' + (r.x - 20) + ',' + ypos + 'L' + (r.x + r.w + 20) + ',' + ypos;
    this.surface.add({
      type : 'path',
      path : path,
      'stroke' : '#666'
    }).show(true);
    var szstep = (this.maxX - this.minX) / CHART_Y_SCALE_STEP;

    // rect 하단에 보조 X축 출력
    for ( var i = 0; i <= CHART_Y_SCALE_STEP; i++) {
      var v = this.minX + szstep * i;
      var xpos = r.x + ((v - min) * r.w) / (max - min);
      path = 'M' + xpos + ',' + (ypos + 5) + 'L' + xpos + ',' + ypos;

      // TODO 디자인: 보조 X축 Line와 문자
      this.surface.add({
        type : 'path',
        path : path,
        'stroke' : '#666'
      }).show(true);
      var text = '';
      if(!!Number(this.v)){
        text = this.v.toFixed(this.precision);
      }
      this.surface.add({
        type : 'text',
        'fill' : '#666',
        'font-size' : '10px',
        'font-family' : 'Verdana',
        'text-anchor' : 'middle',
        text : text,
        x : xpos,
        y : ypos + 10
      }).show(true);
    }
  }

  // 차트 Y축 그리기
  drawYAxis(r) {
    var CHART_Y_SCALE_STEP = 5;

    var min = 0, max, ypos, szstep, yinterval;

    //BAR 차트 값에 max 값을 계산
    max = Math.floor(Math.max.apply(null, this.freqData));

    if (this.autoScaleY) {
      max += 5;
      max = max - max % 5;
    } else {
      min = this.minY;
      max = this.maxY;
    }

    if (max < this.stepY)
      max = this.stepY;

    this.maxY = max;

    if (this.stepY > 0) {
      yinterval = this.stepY;
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

    for ( var i = 0; i <= szstep; i++) {
      var v = min + yinterval * i;
      ypos = (r.y + r.h) - ((v - min) * r.h) / (max - min);
      path = 'M' + (r.x - 5) + ',' + ypos + 'L' + r.x + ',' + ypos;

      // TODO 디자인: Y축 문자, 라인
      this.surface.add({
        type : 'path',
        path : path,
        'stroke' : '#666'   
      }).show(true);
      this.surface.add({
        type : 'text',
        'font-size' : '10px',
        'font-family' : 'Verdana',
        'fill' : '#666',
        'text-anchor' : 'end',
        text : v,
        x : r.x - 10,
        y : ypos
      }).show(true);

      // TODO 디자인: 그리드 라인
      if (this.showGridLine) {
        path = 'M' + (r.x + 1) + ',' + ypos + 'L' + (r.x + r.w) + ',' + ypos;
        this.surface.add({
          type : 'path',
          path : path,
          'opacity' : 0.2
        }).show(true);
      }
    }
  }

  // BAR 차트 그리기
  drawBar(r) {
    var yl, xp1, xp2, hp, yp;

    for ( var i = 0; i < this.binMesh.length - 1; i++) {
      yl = this.freqData[i];

      xp1 = r.x + ((this.binMesh[i] - this.minX) * r.w) / (this.maxX - this.minX); // x
      // pixels
      xp2 = r.x + ((this.binMesh[i + 1] - this.minX) * r.w) / (this.maxX - this.minX);
      hp = (yl - this.minY) * r.h / (this.maxY - this.minY); // height
      // pixels

      yp = r.y + r.h - hp;

      // TODO 디자인: BAR차트 막대
      if (hp > 0) {
        this.surface.add({
          type : 'rect',
          x : xp1,
          y : yp,
          width : xp2 - xp1,
          height : hp,
          fill : '#86c838',
          // opacity : '0.2',
          stroke : '#fff',
          'stroke-width' : 2
        }).show(true);
      }

      // TODO 디자인: BAR차트 막대위 문자
      if (this.showBarLabel) {
        yp = Math.min(yp + hp / 2, r.y + r.h - 20);
        this.surface.add({
          type : 'text',
          'text-anchor' : 'middle',
          'font-size' : '10px',
          'font-family' : 'Verdana',
          //TODO : 색상 흰색은 안보임
          //'fill' : '#fff',
          'fill' : '#ff0000',
          text : this.freqData[i],
          x : (xp1 + xp2) / 2,
          y : yp
        }).show(true);
      }
    }
  }

  // Line 차트 그리기
  drawNormalLine(r) {
    var min, max;

    min = r.x;
    max = r.x + r.w;

    var pos = [];
    var cnt = 0;

    for ( var i = min; i <= max; i++) {
      var x = (i - min) * (this.maxX - this.minX) / r.w + this.minX;

      var dnormal = Stat.dnormal(x, this.mean, this.stddev);

      var y = dnormal;
      dnormal = Stat.dnormal(this.mean, this.mean, this.stddev);

      var ypos = (r.y + r.h) - (y * r.h / dnormal);

      if (ypos > (r.y + r.h))
        continue;

      pos[cnt++] = i + ',' + Math.floor(ypos);
    }

    pos[cnt++] = (r.x + r.w) + ',' + (r.y + r.h);
    pos[cnt++] = (r.x) + ',' + (r.y + r.h);

    // TODO 디자인: 라인 차트 라인, 라인 배경
    var path = 'M' + pos.join('L');
    this.surface.add({
      type : 'path',
      path : path,
      'fill' : '#abd7f9',
      'opacity' : 0.4,
      'stroke' : '#017ed5',
      'stroke-width' : 1
    }).show(true);
  }

  // Mean, 3Sigma Line 그리기
  draw3SLine(r) {
    /* Mean Line 그리기 */

    var origin = {
      x : r.x,
      y : r.y + r.h
    };
    var min = this.minX, max = this.maxX;

    var xpos = origin.x + (((this.mean - min) * r.w) / (max - min));
    var ypos = origin.y;

    //TODO 디자인: 문자(M)
    if (xpos > r.x - 20 && xpos < (r.x + r.w) + 20) {
      this.surface.add({
        type : 'path',
        path : 'M' + xpos + ',' + ypos + 'L' + xpos + ',' + (ypos - r.h - 10),
        stroke : '#da5165'
      }).show(true);
      this.surface.add({
        type : 'text',
        'font-family' : 'Verdana',
        'font-size' : '12px',
        'text-anchor' : 'middle',
        //'opacity' : 1.0,
        'fill' : '#da5165',
        text : 'M',
        x : xpos,
        y : ypos - r.h - 15
      }).show(true);
    }

    var textHeight = 20;

    if (this.showSpecLimit) {
      var text = '';
      if(!!Number(this.mean)){
        text = this.mean.toFixed(this.precision);
      }
      this.surface.add({
        type : 'text',
        'font-size' : '10px',
        'font-family' : 'Verdana',
        'text-anchor' : 'middle',
        'opacity' : 1.0,
        'fill' : '#da5165',
        text : text,
        x : xpos,
        y : ypos + textHeight * 2
      }).show(true);
    } else {
      var text = '';
      if(!!Number(this.mean)){
        text = this.mean.toFixed(this.precision);
      }
      this.surface.add({
        type : 'text',
        'font-size' : '10px',
        'font-family' : 'Verdana',
        'text-anchor' : 'middle',
        'opacity' : 1.0,
        'fill' : '#da5165',
        text : text,
        x : xpos,
        y : ypos + textHeight
      }).show(true);
    }

    if (this.stddev == 0)
      return;

    /* 3Sigma Line 그리기 */

    var l3sigma = this.mean - this.stddev * 3;
    var u3sigma = this.mean + this.stddev * 3;

    xpos = origin.x + (((l3sigma - min) * r.w) / (max - min));

    //TODO 디자인: 문자(-3s)
    if (xpos > r.x - 20 && xpos < (r.x + r.w) + 20) {
      this.surface.add({
        type : 'path',
        path : 'M' + xpos + ',' + ypos + 'L' + xpos + ',' + (ypos - r.h - 10),
        stroke : '#da5165'
      }).show(true);
      this.surface.add({
        type : 'text',
        'font-size' : '12px',
        'font-family' : 'Verdana',
        'text-anchor' : 'middle',
        'opacity' : 1.0,
        'fill' : '#da5165',
        text : '-3s',
        x : xpos,
        y : ypos - r.h - 15
      }).show(true);
    }

    if (this.showSpecLimit) {
      var text = '';
      if(!!Number(l3sigma)){
        text = l3sigma.toFixed(this.precision);
      }
      this.surface.add({
        type : 'text',
        'font-size' : '10px',
        'font-family' : 'Verdana',
        'text-anchor' : 'middle',
        'opacity' : 1.0,
        'fill' : '#da5165',
        text :  text,
        x : xpos,
        y : ypos + textHeight * 2
      }).show(true);
    } else {
      var text = '';
      if(!!Number(l3sigma)){
        text = l3sigma.toFixed(this.precision);
      }
      this.surface.add({
        type : 'text',
        'font-size' : '10px',
        'font-family' : 'Verdana',
        'text-anchor' : 'middle',
        'opacity' : 1.0,
        'fill' : '#da5165',
        text :  text,
        x : xpos,
        y : ypos + textHeight
      }).show(true);
    }

    xpos = origin.x + (((u3sigma - min) * r.w) / (max - min));

    //TODO 디자인: 문자(3s)
    if (xpos > r.x - 20 && xpos < (r.x + r.w) + 20) {
      this.surface.add({
        type : 'path',
        path : 'M' + xpos + ',' + ypos + 'L' + xpos + ',' + (ypos - r.h - 10),
        stroke : '#da5165'
      }).show(true);
      this.surface.add({
        type : 'text',
        'font-size' : '12px',
        'font-family' : 'Verdana',
        'text-anchor' : 'middle',
        'opacity' : 1.0,
        'fill' : '#da5165',
        text : '3s',
        x : xpos,
        y : ypos - r.h - 15
      }).show(true);
    }

    if (this.showSpecLimit) {
      var text = '';
      if(!!Number(u3sigma)){
        text = u3sigma.toFixed(this.precision);
      }
      this.surface.add({
        type : 'text',
        'font-size' : '10px',
        'font-family' : 'Verdana',
        'text-anchor' : 'middle',
        'opacity' : 1.0,
        'fill' : '#da5165',
        text : text,
        x : xpos,
        y : ypos + textHeight * 2
      }).show(true);
    } else {
      var text = '';
      if(!!Number(u3sigma)){
        text = u3sigma.toFixed(this.precision);
      }
      this.surface.add({
        type : 'text',
        'font-size' : '10px',
        'font-family' : 'Verdana',
        'text-anchor' : 'middle',
        'opacity' : 1.0,
        'fill' : '#da5165',
        text : text,
        x : xpos,
        y : ypos + textHeight
      }).show(true);
    }
  }

  // Target, Spec Line 그리기
  drawSpecLine(r) {
    /* Target Line 그리기 */

    var origin = {
      x : r.x,
      y : r.y + r.h
    };
    var min = this.minX, max = this.maxX;

    var xpos = origin.x + (((this.target - min) * r.w) / (max - min));
    var ypos = origin.y;

    //TODO 디자인: 문자(T)
    if (xpos > r.x - 20 && xpos < (r.x + r.w) + 20) {
      this.surface.add({
        type : 'path',
        path :'M' + xpos + ',' + ypos + 'L' + xpos + ',' + (ypos - r.h - 0),
        'stroke' : '#ffa500'
      }).show(true);
      this.surface.add({
        type : 'text',
        'font-size' : '11px',
        'font-family' : 'Verdana',
        'text-anchor' : 'middle',
        'opacity' : 1.0,
        'fill' : '#ffa500',
        text : 'T',
        x : xpos,
        y : ypos - r.h - 5
      }).show(true);
    }

    var textHeight = 25;
    
    var text = '';
    if(!!Number(this.target)){
      text = this.target.toFixed(this.precision);
    }
    this.surface.add({
      type : 'text',
      'font-size' : '10px',
      'font-family' : 'Verdana',
      'text-anchor' : 'middle',
      'opacity' : 1.0,
      'fill' : '#ffa500',
      text :text,
      x : xpos,
      y :ypos + textHeight
    }).show(true);

    if (this.stddev == 0)
      return;

    /* Spec Line 그리기 */

    xpos = origin.x + (((this.lsl - min) * r.w) / (max - min));

    if (xpos > r.x - 20 && xpos < (r.x + r.w) + 20) {
      this.surface.add({
        type : 'path',
        path :'M' + xpos + ',' + ypos + 'L' + xpos + ',' + (ypos - r.h - 0),
        'stroke' : '#ffa500'
      }).show(true);
      this.surface.add({
        type : 'text',
        'font-size' : '11px',
        'font-family' : 'Verdana',
        'text-anchor' : 'middle',
        'opacity' : 1.0,
        'fill' : '#ffa500',
        text : 'LSL',
        x : xpos,
        y : ypos - r.h - 5
      }).show(true);
    }
    var text = '';
    if(!!Number(this.lsl)){
      text = this.lsl.toFixed(this.precision);
    }
    this.surface.add({
      type : 'text',
      'font-size' : '10px',
      'font-family' : 'Verdana',
      'text-anchor' : 'middle',
      'opacity' : 1.0,
      'fill' : '#ffa500',
      text :text,
      x : xpos,
      y :ypos + textHeight
    }).show(true);
    
    xpos = origin.x + (((this.usl - min) * r.w) / (max - min));

    if (xpos > r.x - 20 && xpos < (r.x + r.w) + 20) {
      this.surface.add({
        type : 'path',
        path : 'M' + xpos + ',' + ypos + 'L' + xpos + ',' + (ypos - r.h - 0),
        'stroke' : '#ffa500'
      }).show(true);
      this.surface.add({
        type : 'text',
        'font-size' : '11px',
        'font-family' : 'Verdana',
        'text-anchor' : 'middle',
        'opacity' : 1.0,
        'fill' : '#ffa500',
        text : 'USL',
        x : xpos,
        y : ypos - r.h - 5
      }).show(true);
    }
    if(!!Number(this.usl)){
      text = this.usl.toFixed(this.precision);
    }
    this.surface.add({
      type : 'text',
      'font-size' : '10px',
      'font-family' : 'Verdana',
      'text-anchor' : 'middle',
      'opacity' : 1.0,
      'fill' : '#ffa500',
      text :text,
      x : xpos,
      y : ypos + textHeight
    }).show(true);
  }
}

Component.register('Histogam', histogam)
