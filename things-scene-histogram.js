(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _stat = require('./stat');

var Stat = _interopRequireWildcard(_stat);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _scene = scene;
var Component = _scene.Component;
var Rect = _scene.Rect;


var CHART_BORDER_PIXELS = 10;
var CHART_Y_SCALE_STEP = 5;

var Histogram = function (_Rect) {
  _inherits(Histogram, _Rect);

  function Histogram(model, context) {
    _classCallCheck(this, Histogram);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(Histogram).call(this, model, context));

    _this.min = null; // 데이터 배열 최소값
    _this.max = null; // 데이터 배열 최대값
    _this.mean = null; // 데이터 배열 평균
    _this.stddev = null; // 표준편차
    _this.freqData = []; // BAR 차트 배열 데이터
    _this.binMesh = []; // X축 배열 데이터
    _this.binfirst = null; // X축 처음값
    _this.binlast = null; // X축 마지막값
    _this.binwidth = null; // X축 간격(BAR 차트 넓이)
    _this.binsize = null; // BAR 차트 생성 갯수
    _this.calculated = false; //차트 기준값 계산 완료 상태(true : 완료, false: 미완료)

    _this.initCalc();
    _this.calculate();
    return _this;
  }

  _createClass(Histogram, [{
    key: '_draw',
    value: function _draw(context) {
      var _model = //Y축 max 최소값
      this.model;
      var _model$value = _model.value;
      var value = _model$value === undefined ? 0 : _model$value;
      var _model$hidden = _model.hidden;
      var hidden = _model$hidden === undefined ? false : _model$hidden;
      var fillStyle = _model.fillStyle;
      var blankStrokeStyle = _model.blankStrokeStyle;
      var top = _model.top;
      var left = _model.left;
      var width = _model.width;
      var height = _model.height;
      var _model$data = _model.data;
      var
      // 차트 데이타 리스트(valueList)
      data = _model$data === undefined ? [] : _model$data;
      var _model$topTitle = _model.topTitle;
      var

      // 차트 제목 설정
      topTitle = _model$topTitle === undefined ? '' : _model$topTitle;
      var _model$bottomTitle = _model.bottomTitle;
      var bottomTitle = _model$bottomTitle === undefined ? '' : _model$bottomTitle;
      var _model$leftTitle = _model.leftTitle;
      var leftTitle = _model$leftTitle === undefined ? '' : _model$leftTitle;
      var _model$show3SigmaLine = _model.show3SigmaLine;
      var

      // 차트 화면표시 설정
      show3SigmaLine = _model$show3SigmaLine === undefined ? true : _model$show3SigmaLine;
      var _model$showNormalLine = _model.showNormalLine;
      var showNormalLine = _model$showNormalLine === undefined ? true : _model$showNormalLine;
      var _model$showSpecLimit = _model.showSpecLimit;
      var showSpecLimit = _model$showSpecLimit === undefined ? true : _model$showSpecLimit;
      var _model$showGridLine = _model.showGridLine;
      var showGridLine = _model$showGridLine === undefined ? true : _model$showGridLine;
      var _model$showBarLabel = _model.showBarLabel;
      var showBarLabel = _model$showBarLabel === undefined ? true : _model$showBarLabel;
      var _model$precision = _model.precision;
      var precision = _model$precision === undefined ? 4 : _model$precision;
      var _model$autoScaleX = _model.autoScaleX;
      var // 차트 표시 소수점 자릿수

      autoScaleX = _model$autoScaleX === undefined ? true : _model$autoScaleX;
      var _model$autoScaleY = _model.autoScaleY;
      var // X축 최소값, 최대값 자동계산 여부(true : 자동, false : 설정)
      autoScaleY = _model$autoScaleY === undefined ? true : _model$autoScaleY;
      var _model$minX = _model.minX;
      var // Y축 최소값, 최대값 자동계산 여부(true : 자동, false : 설정)
      minX = _model$minX === undefined ? 0 : _model$minX;
      var _model$maxX = _model.maxX;
      var // 사용자 정의 X축 최소값
      maxX = _model$maxX === undefined ? 100000 : _model$maxX;
      var _model$minY = _model.minY;
      var // 사용자 정의 X축 최대값
      minY = _model$minY === undefined ? 0 : _model$minY;
      var _model$maxY = _model.maxY;
      var // 사용자 정의 Y축 최소값
      maxY = _model$maxY === undefined ? 100 : _model$maxY;
      var _model$stepY = _model.stepY;
      var // 사용자 정의 Y축 최대값

      stepY = _model$stepY === undefined ? 0 : _model$stepY;


      if (!hidden) {

        context.translate(left, top);

        context.beginPath();

        this.drawChart(context, width, height);

        context.closePath();

        context.translate(-left, -top);
      }
    }
  }, {
    key: 'addValue',


    // 차트 데이터 추가
    value: function addValue(v) {
      this.model.data.push(v);

      this.initCalc();
      this.calculate();
    }

    // 차트 데이터 배열 추가

  }, {
    key: 'setData',
    value: function setData(data) {
      this.model.data = data;

      this.initCalc();
      this.calculate();
    }

    // 차트 데이터 초기화

  }, {
    key: 'resetData',
    value: function resetData() {
      this.model.data = [];

      this.initCalc();
      this.calculate();
    }

    // 차트 데이터 갯수

  }, {
    key: 'getDataCount',
    value: function getDataCount() {
      return this.model.data.length;
    }

    // 차트 데이터 설정 초기화

  }, {
    key: 'initCalc',
    value: function initCalc() {
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

  }, {
    key: 'calculate',
    value: function calculate() {
      var data = this.model.data;


      if (data.length < 2) return false;

      if (!Number(data[0])) return false;

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
        this.binfirst = Math.floor(min) - 2;
        this.binlast = Math.floor(min) + 3;
      } else {
        var temp = this.min;

        if (Math.abs(this.binwidth) >= 1) {
          for (var i = 1; i <= minunit; i++) {
            temp /= 10;
          }
          temp = Math.floor(temp) - 0.5;
          for (var i = 1; i <= minunit; i++) {
            temp *= 10;
          }
          this.binfirst = temp;
        } else {
          for (var i = 1; i <= minunit; i++) {
            temp *= 10;
          }
          temp = Math.floor(temp) - 0.5;
          for (var i = 1; i <= minunit; i++) {
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
      for (var i = 0; i <= this.binsize; i++) {
        this.freqData.push(0);
        this.binMesh.push(this.binfirst + this.binwidth * i);
      }

      // BAR 차트 데이터 배열 값 설정
      var sum = 0,
          idx,
          dv;
      for (var i = 0; i < data.length; i++) {
        dv = data[i];
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
          if (this.freqData[0] !== 0) break;

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
  }, {
    key: 'onchange',
    value: function onchange(after) {}
    // TODO data등 계산로직과 관련된 부분의 변경이 있을 때 다시 계산하도록 한다.
    // this.initCalc()
    // this.calculate()


    // 차트 그리기(전체 화면 다시그림)
    // * 화면을 각각 개별로 다시 그리고 싶다면 그린 element를 변수로 저장하고 remove 함수로 삭제

  }, {
    key: 'drawChart',
    value: function drawChart(context, width, height) {
      var _model2 = this.model;
      var data = _model2.data;
      var showNormalLine = _model2.showNormalLine;
      var showSpecLimit = _model2.showSpecLimit;
      var show3SigmaLine = _model2.show3SigmaLine;

      // 데이타 배열 체크

      if (data.length < 2 || !Number(width) || !Number(height)) return false;

      // 차트 초기화
      context.beginPath();
      this.drawTitle(context, width, height);

      var rect = this.getRect(width, height);
      context.beginPath();
      this.drawXAxis(context, rect);
      context.beginPath();
      this.drawYAxis(context, rect);
      context.beginPath();
      this.drawBar(context, rect);
      context.beginPath();
      this.drawRegion(context, rect);
      if (showNormalLine === true) {
        context.beginPath();
        this.drawNormalLine(context, rect);
      }

      if (show3SigmaLine === true) {
        context.beginPath();
        this.draw3SLine(context, rect);
      }

      if (showSpecLimit === true) {
        context.beginPath();
        this.drawSpecLine(context, rect);
      }
    }
  }, {
    key: 'getRect',
    value: function getRect(w, h) {
      var CHART_LEFT_GAP_PIXELS = 60;
      var CHART_RIGHT_GAP_PIXELS = 30;
      var CHART_TOP_GAP_PIXELS = 50;
      var CHART_BOTTOM_GAP_PIXELS = 90;

      var rect = {
        x: CHART_LEFT_GAP_PIXELS,
        y: CHART_TOP_GAP_PIXELS,
        w: w - CHART_LEFT_GAP_PIXELS - CHART_RIGHT_GAP_PIXELS,
        h: h - CHART_TOP_GAP_PIXELS - CHART_BOTTOM_GAP_PIXELS
      };
      return rect;
    }

    // 차트 제목 그리기

  }, {
    key: 'drawTitle',
    value: function drawTitle(context, w, h) {
      var _model3 = this.model;
      var _model3$topTitle = _model3.topTitle;
      var topTitle = _model3$topTitle === undefined ? '' : _model3$topTitle;
      var _model3$bottomTitle = _model3.bottomTitle;
      var bottomTitle = _model3$bottomTitle === undefined ? '' : _model3$bottomTitle;
      var _model3$leftTitle = _model3.leftTitle;
      var leftTitle = _model3$leftTitle === undefined ? '' : _model3$leftTitle;


      var rect = {
        x: CHART_BORDER_PIXELS, // x좌표
        y: CHART_BORDER_PIXELS, // y좌표
        w: w - 2 * CHART_BORDER_PIXELS, // 넓이
        h: h - 2 * CHART_BORDER_PIXELS // 높이
      };

      // TODO 디자인: 차트에 top, left, bottom 문자
      context.fillStyle = '#315A9D';
      context.fontSize = '13px';
      context.fontFamily = 'Verdana';
      context.fontWeight = 'bold';
      context.textBaseline = 'middle';

      if (topTitle) {
        context.fillText(topTitle, rect.x + rect.w / 2, rect.y);
      }
      if (bottomTitle) {
        context.fillText(bottomTitle, rect.x + rect.w / 2, rect.y + rect.h - 2);
      }
      if (leftTitle) {
        context.translate(rect.x + 5, rect.y + rect.h / 2);
        context.rotate(-Math.PI / 2);
        context.fillText(leftTitle, rect.x + 5, rect.y + rect.h / 2);
        context.rotate(Math.PI / 2);
        context.translate(-rect.x + 5, -(rect.y + rect.h / 2));
      }
    }
    // 차트 사각형 영역 그리기

  }, {
    key: 'drawRegion',
    value: function drawRegion(context, rect) {
      // TODO 디자인: 차트 사각형 영역
      context.strokeStyle = '#666';
      context.lineWidth = 1;
      context.rect(rect.x, rect.y, rect.w, rect.h);
    }

    // 차트 X축 그리기

  }, {
    key: 'drawXAxis',
    value: function drawXAxis(context, r) {
      var _model4 = this.model;
      var autoScaleX = _model4.autoScaleX;
      var show3SigmaLine = _model4.show3SigmaLine;
      var showSpecLimit = _model4.showSpecLimit;
      var precision = _model4.precision;
      var minX = _model4.minX;
      var maxX = _model4.maxX;
      var target = _model4.target;
      var lsl = _model4.lsl;
      var usl = _model4.usl;

      var min, max, xpos, ypos;
      var textHeight = 15;

      if (autoScaleX) {
        // this.binMesh, mean, target, usl, lsl 데이터로 최소값, 최대값 생성하여 설정
        min = this.binMesh[0];
        max = this.binMesh[this.binMesh.length - 1];

        var vs = [min, max];

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
      context.beginPath();

      context.fontSize = '10px';
      context.fontFamily = 'Verdana';
      context.textAlign = 'center';
      context.strokeStyle = '#666';
      context.lineWidth = 1;

      // X축 문자 최대 가로 넓이 계산
      for (var i = 0; i < this.binMesh.length; i++) {
        xpos = r.x + (this.binMesh[i] - min) * r.w / (max - min);
        var text = '';
        if (!!Number(this.binMesh[i])) {
          text = this.binMesh[i].toFixed(precision);
        }

        context.fillText(text, xpos, ypos + 10);

        // var tBox = t.getBBox();
        // maxTextSize = Math.max(maxTextSize, tBox.width);
        // t.remove();
      }

      // X축 passCount 계산
      for (var i = 0; i < this.binMesh.length; i++) {
        xpos = r.x + (this.binMesh[i] - min) * r.w / (max - min);
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
      context.beginPath();

      for (var i = 0; i < this.binMesh.length; i++) {
        xpos = r.x + (this.binMesh[i] - min) * r.w / (max - min);
        // passCount에 따른 X축 출력
        if (iCount % passCount == 0) {
          // X축 라인, 문자
          context.moveTo(xpos, ypos + 5);
          context.lineTo(xpos, ypos);
          context.stroke();

          var text = '';
          if (!!Number(this.binMesh[i])) {
            text = this.binMesh[i].toFixed(precision);
          }
          context.fillStyle = '#666';
          context.fillText(text, xpos, ypos + 10);
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
      context.moveTo(r.x - 20, ypos);
      context.lineTo(r.x + r.w + 20, ypos);
      context.stroke();

      var szstep = (max - min) / CHART_Y_SCALE_STEP;

      // rect 하단에 보조 X축 출력
      for (var i = 0; i <= CHART_Y_SCALE_STEP; i++) {
        var v = min + szstep * i;
        var xpos = r.x + (v - min) * r.w / (max - min);

        // TODO 디자인: 보조 X축 Line와 문자
        context.moveTo(xpos, ypos + 5);
        context.lineTo(xpos, ypos);
        context.stroke();

        var text = '';
        if (!!Number(this.v)) {
          text = this.v.toFixed(precision);
        }
        context.beginPath();
        context.fillStyle = '#666';
        context.fillText(text, xpos, ypos + 10);
      }
    }

    // 차트 Y축 그리기

  }, {
    key: 'drawYAxis',
    value: function drawYAxis(context, r) {
      var min = 0,
          max,
          ypos,
          szstep,
          yinterval;
      var _model5 = this.model;
      var minY = _model5.minY;
      var maxY = _model5.maxY;
      var stepY = _model5.stepY;
      var autoScaleY = _model5.autoScaleY;
      var showGridLine = _model5.showGridLine;
      var _model5$alpha = _model5.alpha;
      var alpha = _model5$alpha === undefined ? 1 : _model5$alpha;

      //BAR 차트 값에 max 값을 계산

      max = Math.floor(Math.max.apply(null, this.freqData));

      if (autoScaleY) {
        max += 5;
        max = max - max % 5;
      } else {
        min = minY;
        max = maxY;
      }

      if (max < stepY) max = stepY;

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

      context.beginPath();
      context.fontSize = '10px';
      context.fontFamily = 'Verdana';
      context.textBaseline = 'end';
      context.fillStyle = '#666';
      context.strokeStyle = '#666';
      context.lineWidth = 1;

      for (var i = 0; i <= szstep; i++) {
        var v = min + yinterval * i;
        ypos = r.y + r.h - (v - min) * r.h / (max - min);

        context.beginPath();

        // TODO 디자인: Y축 문자, 라인
        context.globalAlpha = alpha;

        context.moveTo(r.x - 5, ypos);
        context.lineTo(r.x, ypos);
        context.stroke();

        context.fillText(v, r.x - 10, ypos);

        // TODO 디자인: 그리드 라인
        if (showGridLine) {
          context.beginPath();
          context.globalAlpha = 0.2 * alpha;
          context.moveTo(r.x + 1, ypos);
          context.lineTo(r.x + r.w, ypos);
          context.stroke();
        }
      }
      context.globalAlpha = alpha;
    }

    // BAR 차트 그리기

  }, {
    key: 'drawBar',
    value: function drawBar(context, r) {
      var yl, xp1, xp2, hp, yp;
      var _model6 = this.model;
      var minX = _model6.minX;
      var maxX = _model6.maxX;
      var minY = _model6.minY;
      var maxY = _model6.maxY;
      var showBarLabel = _model6.showBarLabel;


      for (var i = 0; i < this.binMesh.length - 1; i++) {
        yl = this.freqData[i];

        xp1 = r.x + (this.binMesh[i] - minX) * r.w / (maxX - minX); // x
        // pixels
        xp2 = r.x + (this.binMesh[i + 1] - minX) * r.w / (maxX - minX);
        hp = (yl - minY) * r.h / (maxY - minY); // height
        // pixels

        yp = r.y + r.h - hp;

        // TODO 디자인: BAR차트 막대
        if (hp > 0) {
          context.beginPath();

          context.fillStyle = '#86c838';
          context.strokeStyle = '#fff';
          context.lineWidth = 2;
          context.rect(xp1, yp, xp2 - xp1, hp);
          context.stroke();
          context.fill();
        }

        // TODO 디자인: BAR차트 막대위 문자
        if (showBarLabel) {
          context.beginPath();

          yp = Math.min(yp + hp / 2, r.y + r.h - 20);

          context.fontSize = '10px';
          context.fontFamily = 'Verdana';
          context.textBaseline = 'middle';
          context.fillStyle = '#ff0000';

          context.fillText(this.freqData[i], (xp1 + xp2) / 2, yp);
        }
      }
    }

    // Line 차트 그리기

  }, {
    key: 'drawNormalLine',
    value: function drawNormalLine(context, r) {
      var _model7 = this.model;
      var maxX = _model7.maxX;
      var minX = _model7.minX;
      var _model7$alpha = _model7.alpha;
      var alpha = _model7$alpha === undefined ? 1 : _model7$alpha;

      var min = r.x;
      var max = r.x + r.w;

      // TODO 디자인: 라인 차트 라인, 라인 배경

      context.beginPath();

      context.strokeStyle = '#017ed5';
      context.fillStyle = '#abd7f9';
      context.lineWidth = 1;
      context.globalAlpha = 0.4 * alpha;

      for (var i = min + 1; i <= max; i++) {
        var x = (i - min) * (maxX - minX) / r.w + minX;

        var dnormal = Stat.dnormal(x, this.mean, this.stddev);

        var y = dnormal;
        dnormal = Stat.dnormal(this.mean, this.mean, this.stddev);

        var ypos = r.y + r.h - y * r.h / dnormal;

        if (ypos > r.y + r.h) continue;

        if (i == min) context.moveTo(i, Math.floor(ypos));else context.lineTo(i, Math.floor(ypos));
      }

      context.stroke();
      context.fill();

      context.globalAlpha = alpha;
    }

    // Mean, 3Sigma Line 그리기

  }, {
    key: 'draw3SLine',
    value: function draw3SLine(context, r) {
      /* Mean Line 그리기 */
      var _model8 = this.model;
      var minX = _model8.minX;
      var maxX = _model8.maxX;
      var showSpecLimit = _model8.showSpecLimit;
      var precision = _model8.precision;

      var origin = {
        x: r.x,
        y: r.y + r.h
      };
      var min = minX,
          max = maxX;

      var xpos = origin.x + (this.mean - min) * r.w / (max - min);
      var ypos = origin.y;

      //TODO 디자인: 문자(M)
      context.beginPath();

      context.fontSize = '12px';
      context.fontFamily = 'Verdana';
      context.textBaseline = 'middle';
      context.fillStyle = '#da5165';
      context.strokeStyle = '#da5165';
      context.lineWidth = 1;

      if (xpos > r.x - 20 && xpos < r.x + r.w + 20) {

        context.moveTo(xpos, ypos);
        context.lineTo(xpos, ypos - r.h - 10);
        context.stroke();

        context.fillText('M', xpos, ypos - r.h - 15);
      }

      var textHeight = 20;

      if (showSpecLimit) {
        var text = '';
        if (!!Number(this.mean)) {
          text = this.mean.toFixed(precision);
        }
        context.beginPath();
        context.fontSize = '10px';
        context.fillText(text, xpos, ypos + textHeight * 2);
      } else {
        var text = '';
        if (!!Number(this.mean)) {
          text = this.mean.toFixed(precision);
        }
        context.beginPath();
        context.fontSize = '10px';
        context.fillText(text, xpos, ypos + textHeight);
      }

      if (this.stddev == 0) return;

      /* 3Sigma Line 그리기 */

      var l3sigma = this.mean - this.stddev * 3;
      var u3sigma = this.mean + this.stddev * 3;

      xpos = origin.x + (l3sigma - min) * r.w / (max - min);

      //TODO 디자인: 문자(-3s)
      if (xpos > r.x - 20 && xpos < r.x + r.w + 20) {

        context.beginPath();

        context.strokeStyle = '#da5165';
        context.lineWidth = 1;
        context.moveTo(xpos, ypos);
        context.lineTo(xpos, ypos - r.h - 10);
        context.stroke();

        context.fontSize = '12px';
        context.fillText('-3s', xpos, ypos - r.h - 15);
      }

      if (showSpecLimit) {
        var text = '';
        if (!!Number(l3sigma)) {
          text = l3sigma.toFixed(precision);
        }
        context.beginPath();
        context.fontSize = '10px';
        context.fillText(text, xpos, ypos + textHeight * 2);
      } else {
        var text = '';
        if (!!Number(l3sigma)) {
          text = l3sigma.toFixed(precision);
        }
        context.beginPath();
        context.fontSize = '10px';
        context.fillText(text, xpos, ypos + textHeight);
      }

      xpos = origin.x + (u3sigma - min) * r.w / (max - min);

      //TODO 디자인: 문자(3s)
      if (xpos > r.x - 20 && xpos < r.x + r.w + 20) {

        context.beginPath();
        context.strokeStyle = '#da5165';
        context.lineWidth = 1;
        context.moveTo(xpos, ypos);
        context.lineTo(xpos, ypos - r.h - 10);
        context.stroke();

        context.fontSize = '12px';
        context.fillText('3s', xpos, ypos - r.h - 15);
      }

      if (showSpecLimit) {
        var text = '';
        if (!!Number(u3sigma)) {
          text = u3sigma.toFixed(precision);
        }
        context.beginPath();
        context.fontSize = '10px';
        context.fillText(text, xpos, ypos + textHeight * 2);
      } else {
        var text = '';
        if (!!Number(u3sigma)) {
          text = u3sigma.toFixed(precision);
        }
        context.beginPath();
        context.fontSize = '10px';
        context.fillText(text, xpos, ypos + textHeight);
      }
    }

    // Target, Spec Line 그리기

  }, {
    key: 'drawSpecLine',
    value: function drawSpecLine(context, r) {
      /* Target Line 그리기 */
      var _model9 = this.model;
      var minX = _model9.minX;
      var maxX = _model9.maxX;
      var precision = _model9.precision;
      var target = _model9.target;
      var lsl = _model9.lsl;
      var usl = _model9.usl;

      var origin = {
        x: r.x,
        y: r.y + r.h
      };
      var min = minX,
          max = maxX;

      var xpos = origin.x + (target - min) * r.w / (max - min);
      var ypos = origin.y;

      //TODO 디자인: 문자(T)
      context.beginPath();

      context.fontSize = '10px';
      context.fontFamily = 'Verdana';
      context.textBaseline = 'middle';
      context.fillStyle = '#ffa500';
      context.strokeStyle = '#ffa500';
      context.lineWidth = 1;

      if (xpos > r.x - 20 && xpos < r.x + r.w + 20) {

        context.moveTo(xpos, ypos);
        context.lineTo(xpos, ypos - r.h);
        context.stroke();

        context.fontSize = '11px';
        context.fillText('T', xpos, ypos - r.h - 5);
      }

      var textHeight = 25;

      var text = '';
      if (!!Number(target)) {
        text = target.toFixed(precision);
      }
      context.fontSize = '10px';
      context.fillText(text, xpos, ypos + textHeight);

      if (this.stddev == 0) return;

      /* Spec Line 그리기 */

      xpos = origin.x + (lsl - min) * r.w / (max - min);

      if (xpos > r.x - 20 && xpos < r.x + r.w + 20) {

        context.moveTo(xpos, ypos);
        context.lineTo(xpos, ypos - r.h);
        context.stroke();

        context.fontSize = '11px';
        context.fillText('LSL', xpos, ypos - r.h - 5);
      }
      var text = '';
      if (!!Number(lsl)) {
        text = lsl.toFixed(precision);
      }

      context.fontSize = '10px';
      context.fillText(text, xpos, ypos + textHeight);

      xpos = origin.x + (usl - min) * r.w / (max - min);

      if (xpos > r.x - 20 && xpos < r.x + r.w + 20) {

        context.moveTo(xpos, ypos);
        context.lineTo(xpos, ypos - r.h);
        context.stroke();

        context.fontSize = '11px';
        context.fillText('USL', xpos, ypos - r.h - 5);
      }
      if (!!Number(usl)) {
        text = usl.toFixed(precision);
      }

      context.fontSize = '11px';
      context.fillText(text, xpos, ypos + textHeight);
    }
  }, {
    key: 'controls',
    get: function get() {}
  }]);

  return Histogram;
}(Rect);

exports.default = Histogram;


Component.register('histogram', Histogram);

},{"./stat":3}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _histogram = require('./histogram');

Object.defineProperty(exports, 'Histogram', {
  enumerable: true,
  get: function get() {
    return _interopRequireDefault(_histogram).default;
  }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

},{"./histogram":1}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.min = min;
exports.max = max;
exports.mean = mean;
exports.stddev = stddev;
exports.minunit = minunit;
exports.dnormal = dnormal;
var ONEBYS2PI = 0.3989422804014327;

// 배열 최소 값
function min(data) {
  return Math.min.apply(null, data);
}

// 배열 최대 값
function max(data) {
  return Math.max.apply(null, data);
}

// 배열 평균
function mean(data) {
  return grades.reduce(function (p, c) {
    return p + c;
  }) / grades.length;
}

// 배열 표준편차(Standard deviation)
// 공식 - 배열 데이터 제곱의합 - (배열 사이즈(sample Size) * 배열 데이터 평균값의 제곱)
// / 배열 사이즈(sampleSize) - 1
function stddev(data, mean) {
  if (!(data instanceof Array) || data.length < 1) throw new Error('Data should be instance of Array and have one or more than elements.');

  if (!mean) {
    mean = this.mean(data);
  }

  // Math.pow: 제곱 구하기(Ex) Math.pow(3,2) -> 3제곱(3의 2승)
  // Array.sum: 배열에 합계
  // Array.map: 함수 반환 값으로 새로운 Array 생성
  // var variance = Array.sum(Ext.Array.map(data, function(v) {
  //   return Math.pow(v - mean, 2);
  // })) / data.length;

  var variance = data.reduce(function (sum, d) {
    return sum + Math.pow(d - mean, 2);
  }, 0) / data.length;

  // Math.sqrt: 루트 근사 값
  return Math.sqrt(variance);
}

function minunit(val) {
  if (val == 0) return 1;

  var temp = val;
  var minunit;

  if (Math.abs(temp) >= 1) {
    minunit = 0;
    while (true) {
      temp /= 10;
      if (Math.floor(temp) == 0) {
        temp = val;
        for (var i = 1; i <= minunit; i++) {
          temp /= 10;
        }
        temp = Math.floor(temp) + 0.5;
        for (var i = 1; i <= minunit; i++) {
          temp *= 10;
        }
        return {
          minunit: minunit,
          value: temp
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
        for (var i = 1; i <= minunit; i++) {
          temp *= 10;
        }
        temp = Math.floor(temp) + 0.5;
        for (var i = 1; i <= minunit; i++) {
          temp /= 10;
        }
        return {
          minunit: minunit,
          value: temp
        };
      } else {
        minunit++;
      }
    }
  }
}

function dnormal(x, mu, sigma) {
  if (sigma <= 0) return null;

  var temp = (x - mu) * (x - mu) / (sigma * sigma);
  return ONEBYS2PI * Math.exp(-0.5 * temp);
}

},{}]},{},[1,2,3]);
