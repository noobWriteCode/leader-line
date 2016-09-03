/* eslint-env jasmine */
/* global loadPage:false, customMatchers:false */
/* eslint no-underscore-dangle: [2, {"allow": ["_id"]}] */

describe('attachment', function() {
  'use strict';

  var window, document, traceLog, pageDone, ll, titles = [];

  /* eslint-disable no-unused-vars, indent */
  // ================ context
  var
    CIRCLE_CP = 0.5522847;
  // ================ /context
  /* eslint-enable no-unused-vars, indent */

  var TOLERANCE = 0.001;

  function registerTitle(title) {
    titles.push(title);
    return title;
  }

  function loadBefore(beforeDone) {
    jasmine.addMatchers(customMatchers);
    loadPage('spec/common/page.html', function(frmWindow, frmDocument, body, done) {
      window = frmWindow;
      document = frmDocument;
      traceLog = window.traceLog;
      traceLog.enabled = true;
      pageDone = done;
      ll = new window.LeaderLine(document.getElementById('elm1'), document.getElementById('elm3'));
      beforeDone();
    }, 'attachment - ' + titles.shift());
  }

  function matchPathData(a, b) {
    return a != null && b != null && // eslint-disable-line eqeqeq
      a.length === b.length && a.every(function(aSeg, i) {
        var bSeg = b[i];
        return aSeg.type === bSeg.type &&
          aSeg.values.every(function(aSegValue, i) { return Math.abs(aSegValue - bSeg.values[i]) < TOLERANCE; });
      });
  }

  function getRectByXYWH(x, y, width, height) {
    return {left: x, top: y, width: width, height: height, right: x + width, bottom: y + height};
  }

  function getRectByXYRB(x, y, right, bottom) {
    return {left: x, top: y, right: right, bottom: bottom, width: right - x, height: bottom - y};
  }

  describe('functions', function() {

    beforeEach(loadBefore);

    it(registerTitle('pointAnchor.removeOption'), function(done) {
      var props = window.insProps[ll._id],
        atc, attachProps;

      // replace to attachProps.element
      atc = window.LeaderLine.pointAnchor({element: document.getElementById('elm1')});
      attachProps = window.insAttachProps[atc._id];
      ll.start = atc;
      expect(props.attachments.length).toBe(1);
      expect(attachProps.boundTargets.length).toBe(1);
      atc.remove();
      expect(ll.start).toBe(document.getElementById('elm1'));
      expect(ll.end).toBe(document.getElementById('elm3'));
      expect(props.attachments.length).toBe(0);

      // replace to document.body
      atc = window.LeaderLine.pointAnchor({element: document.getElementById('elm3')});
      attachProps = window.insAttachProps[atc._id];
      ll.start = atc;
      expect(props.attachments.length).toBe(1);
      expect(attachProps.boundTargets.length).toBe(1);
      atc.remove();
      expect(ll.start).toBe(document.body);
      expect(ll.end).toBe(document.getElementById('elm3'));
      expect(props.attachments.length).toBe(0);

      // replace to LeaderLineAttachment
      atc = window.LeaderLine.pointAnchor({element: document.body});
      attachProps = window.insAttachProps[atc._id];
      ll.setOptions({start: atc, end: document.body});
      expect(props.attachments.length).toBe(1);
      expect(attachProps.boundTargets.length).toBe(1);
      atc.remove();
      expect(ll.start).not.toBe(document.body);
      expect(ll.start instanceof window.LeaderLineAttachment).toBe(true);
      expect(ll.start.isRemoved).toBe(false);
      expect(window.insAttachProps[ll.start._id].element).toBe(document.body);
      expect(ll.end).toBe(document.body);
      expect(props.attachments.length).toBe(1);

      pageDone();
      done();
    });

    it(registerTitle('pointAnchor.parsePercent'), function(done) {
      var parsePercent = window.ATTACHMENTS.pointAnchor.parsePercent;
      // -, num, false
      expect(parsePercent(-5) == null).toBe(true); // eslint-disable-line eqeqeq
      // -, num, true
      expect(parsePercent(-5, true)).toEqual([-5, false]);
      // -, per, false
      expect(parsePercent('-5%') == null).toBe(true); // eslint-disable-line eqeqeq
      // -, per, true
      expect(parsePercent('-5%', true)).toEqual([-0.05, true]);
      // +, num, false
      expect(parsePercent(5)).toEqual([5, false]);
      // +, num, true
      expect(parsePercent(5, true)).toEqual([5, false]);
      // +, per, false
      expect(parsePercent('5%')).toEqual([0.05, true]);
      // +, per, true
      expect(parsePercent('5%', true)).toEqual([0.05, true]);
      // zero, num, false
      expect(parsePercent(0)).toEqual([0, false]);
      // zero, num, true
      expect(parsePercent(0, true)).toEqual([0, false]);
      // zero, per, false
      expect(parsePercent('0%')).toEqual([0, false]);
      // zero, per, true
      expect(parsePercent('0%', true)).toEqual([0, false]);

      pageDone();
      done();
    });
  });

  describe('life cycle', function() {

    beforeEach(loadBefore);

    it(registerTitle('bind-unbind-remove'), function(done) {
      var props1 = window.insProps[ll._id], log,
        atc1, atc2, attachProps1, attachProps2, ll2, props2;

      atc1 = window.LeaderLine.pointAnchor({element: document.getElementById('elm1')});
      atc2 = window.LeaderLine.pointAnchor({element: document.getElementById('elm2')});
      attachProps1 = window.insAttachProps[atc1._id];
      attachProps2 = window.insAttachProps[atc2._id];
      expect(atc1.isRemoved).toBe(false);
      expect(atc2.isRemoved).toBe(false);
      expect(window.insAttachProps[atc1._id] != null).toBe(true); // eslint-disable-line eqeqeq
      expect(window.insAttachProps[atc2._id] != null).toBe(true); // eslint-disable-line eqeqeq

      // bind
      expect(props1.attachments.length).toBe(0);
      expect(attachProps1.boundTargets.length).toBe(0);
      ll.start = atc1;
      expect(props1.attachments.length).toBe(1);
      expect(attachProps1.boundTargets.length).toBe(1);
      expect(atc1.isRemoved).toBe(false);
      expect(window.insAttachProps[atc1._id] != null).toBe(true); // eslint-disable-line eqeqeq

      // unbind -> remove
      traceLog.clear();
      ll.start = document.getElementById('elm1');
      setTimeout(function() {
        expect(traceLog.getTaggedLog('removeAttachment')).toEqual([]);
        expect(props1.attachments.length).toBe(0);
        expect(atc1.isRemoved).toBe(true);
        expect(window.insAttachProps[atc1._id] != null).toBe(false); // eslint-disable-line eqeqeq

        // 2 ll - 1 atc
        ll.start = atc2;
        ll2 = new window.LeaderLine(atc2, document.getElementById('elm4'));
        props2 = window.insProps[ll2._id];
        expect(props1.attachments.length).toBe(1);
        expect(props2.attachments.length).toBe(1);
        expect(attachProps2.boundTargets.length).toBe(2);
        expect(atc2.isRemoved).toBe(false);
        expect(window.insAttachProps[atc2._id] != null).toBe(true); // eslint-disable-line eqeqeq

        // unbind 1
        traceLog.clear();
        ll.start = document.getElementById('elm1');
        setTimeout(function() {
          log = traceLog.getTaggedLog('removeAttachment');
          expect(log != null).toBe(false); // eslint-disable-line eqeqeq
          expect(props1.attachments.length).toBe(0);
          expect(props2.attachments.length).toBe(1);
          expect(attachProps2.boundTargets.length).toBe(1);
          expect(atc2.isRemoved).toBe(false);
          expect(window.insAttachProps[atc2._id] != null).toBe(true); // eslint-disable-line eqeqeq

          // unbind 2 -> remove
          traceLog.clear();
          ll2.start = document.getElementById('elm1');
          setTimeout(function() {
            expect(traceLog.getTaggedLog('removeAttachment')).toEqual([]);
            expect(props1.attachments.length).toBe(0);
            expect(props2.attachments.length).toBe(0);
            expect(atc2.isRemoved).toBe(true);
            expect(window.insAttachProps[atc2._id] != null).toBe(false); // eslint-disable-line eqeqeq

            // remove atc -> unbind
            atc1 = window.LeaderLine.pointAnchor({element: document.getElementById('elm1')});
            attachProps1 = window.insAttachProps[atc1._id];
            ll.start = atc1;
            ll2.start = atc1;
            expect(props1.attachments.length).toBe(1);
            expect(props2.attachments.length).toBe(1);
            expect(attachProps1.boundTargets.length).toBe(2);
            expect(atc1.isRemoved).toBe(false);
            traceLog.clear();
            atc1.remove();
            setTimeout(function() {
              expect(traceLog.getTaggedLog('LeaderLineAttachment.remove.delayedProc')).toEqual([]);
              expect(traceLog.getTaggedLog('ATTACHMENTS.pointAnchor.removeOption')).toEqual(['start', 'start']);
              expect(traceLog.getTaggedLog('removeAttachment')).toEqual(['not-found']); // 2nd ll try to remove
              expect(props1.attachments.length).toBe(0);
              expect(props2.attachments.length).toBe(0);
              expect(atc1.isRemoved).toBe(true);
              expect(ll.start).toBe(document.getElementById('elm1'));
              expect(ll2.start).toBe(document.getElementById('elm1'));
              expect(ll.end).toBe(document.getElementById('elm3')); // not changed
              expect(ll2.end).toBe(document.getElementById('elm4')); // not changed

              // remove ll -> unbind -> remove atc
              atc1 = window.LeaderLine.pointAnchor({element: document.getElementById('elm1')});
              atc2 = window.LeaderLine.pointAnchor({element: document.getElementById('elm2')});
              attachProps1 = window.insAttachProps[atc1._id];
              attachProps2 = window.insAttachProps[atc2._id];
              ll.setOptions({start: atc1, end: atc2});
              expect(props1.attachments.length).toBe(2);
              expect(attachProps1.boundTargets.length).toBe(1);
              expect(attachProps2.boundTargets.length).toBe(1);
              expect(atc1.isRemoved).toBe(false);
              expect(atc2.isRemoved).toBe(false);
              traceLog.clear();
              ll.remove();
              setTimeout(function() {
                expect(traceLog.getTaggedLog('removeAttachment')).toEqual([]);
                expect(atc1.isRemoved).toBe(true);
                expect(atc2.isRemoved).toBe(true);

                pageDone();
                done();
              }, 50);
            }, 50);
          }, 50);
        }, 50);
      }, 50);
    });

    it(registerTitle('flow'), function(done) {
      var props1 = window.insProps[ll._id],
        atc1, atc2, attachProps1, attachProps2, ll2, props2;

      traceLog.clear();
      atc1 = window.LeaderLine.areaAnchor({element: document.getElementById('elm1')});
      expect(traceLog.log).toEqual([
        '<ATTACHMENTS.areaAnchor.init>', '</ATTACHMENTS.areaAnchor.init>'
      ]);
      atc2 = window.LeaderLine.areaAnchor({element: document.getElementById('elm2')});
      attachProps1 = window.insAttachProps[atc1._id];
      attachProps2 = window.insAttachProps[atc2._id];

      // bind
      traceLog.clear();
      ll.start = atc1;
      expect(traceLog.log).toEqual([
        '<ATTACHMENTS.areaAnchor.bind>', '</ATTACHMENTS.areaAnchor.bind>',
        '<setOptions>', 'needs.position', '</setOptions>',
        '<updatePosition>',
        '<ATTACHMENTS.areaAnchor.update>',
        'strokeWidth=4', 'elementWidth=100', 'elementHeight=30',
        'generate-path', 'strokeWidth=4', 'pathData',
        'x', 'y', 'width', 'height',
        '</ATTACHMENTS.areaAnchor.update>',
        'position_socketXYSE[0]', 'new-position',
        '</updatePosition>',
        '<updatePath>', 'path_pathData', '</updatePath>',
        '<updateViewBox>', 'x', 'width', 'height', '</updateViewBox>',
        '<updateMask>',
        'maskBGRect_x', 'lineMask_x',
        'capsMaskAnchor_pathDataSE[0]', 'capsMaskAnchor_strokeWidthSE[0]=4',
        '</updateMask>',
        '<update>', 'updated.position', 'updated.path', 'updated.viewBox', 'updated.mask', '</update>'
      ]);
      expect(props1.events.cur_line_color.length).toBe(1); // addEventHandler
      expect(props1.events.svgShow.length).toBe(1); // addEventHandler

      // unbind -> remove
      traceLog.clear();
      ll.start = document.getElementById('elm1');
      setTimeout(function() {
        expect(traceLog.log).toEqual([
          '<ATTACHMENTS.areaAnchor.unbind>', '</ATTACHMENTS.areaAnchor.unbind>',
          '<setOptions>', 'needs.position', '</setOptions>',
          '<updatePosition>', 'position_socketXYSE[0]', 'new-position', '</updatePosition>',
          '<updatePath>', 'path_pathData', '</updatePath>',
          '<updateViewBox>', 'x', 'width', 'height', '</updateViewBox>',
          '<updateMask>',
          'maskBGRect_x', 'lineMask_x',
          'capsMaskAnchor_pathDataSE[0]', 'capsMaskAnchor_strokeWidthSE[0]=0',
          '</updateMask>',
          '<update>', 'updated.position', 'updated.path', 'updated.viewBox', 'updated.mask', '</update>',
          '<execDelayedProcs>',
          '<ATTACHMENTS.areaAnchor.updateColor>', 'color=coral', '</ATTACHMENTS.areaAnchor.updateColor>',
          '<svgShow>', '</svgShow>',
          '<ATTACHMENTS.areaAnchor.updateColor>', '</ATTACHMENTS.areaAnchor.updateColor>',
          '<svgShow>', '</svgShow>',
          '<ATTACHMENTS.areaAnchor.update>', '</ATTACHMENTS.areaAnchor.update>',
          '<removeAttachment>', '<ATTACHMENTS.areaAnchor.remove>', '</ATTACHMENTS.areaAnchor.remove>', '</removeAttachment>',
          '</execDelayedProcs>'
        ]);
        expect(props1.attachments.length).toBe(0);
        expect(atc1.isRemoved).toBe(true);
        expect(props1.events.cur_line_color.length).toBe(0); // removeEventHandler
        expect(props1.events.svgShow.length).toBe(0); // removeEventHandler

        // 2 ll - 1 atc
        ll.start = atc2;
        ll2 = new window.LeaderLine(atc2, document.getElementById('elm4'));
        props2 = window.insProps[ll2._id];
        expect(props1.attachments.length).toBe(1);
        expect(props2.attachments.length).toBe(1);
        expect(attachProps2.boundTargets.length).toBe(2);
        expect(props1.events.cur_line_color.length).toBe(1); // addEventHandler
        expect(props1.events.svgShow.length).toBe(1); // addEventHandler
        expect(props2.events.cur_line_color.length).toBe(1); // addEventHandler
        expect(props2.events.svgShow.length).toBe(1); // addEventHandler

        // unbind 1
        traceLog.clear();
        ll.start = document.getElementById('elm1');
        setTimeout(function() {
          expect(traceLog.log).toEqual([
            '<ATTACHMENTS.areaAnchor.unbind>', '</ATTACHMENTS.areaAnchor.unbind>',
            '<setOptions>', 'needs.position', '</setOptions>',
            '<updatePosition>', 'position_socketXYSE[0]', 'new-position', '</updatePosition>',
            '<updatePath>', 'path_pathData', '</updatePath>',
            '<updateViewBox>', 'x', 'y', 'width', 'height', '</updateViewBox>',
            '<updateMask>',
            'maskBGRect_x', 'maskBGRect_y', 'lineMask_x', 'lineMask_y',
            'capsMaskAnchor_pathDataSE[0]', 'capsMaskAnchor_strokeWidthSE[0]=0',
            '</updateMask>',
            '<update>', 'updated.position', 'updated.path', 'updated.viewBox', 'updated.mask', '</update>',
            '<execDelayedProcs>',
            '<ATTACHMENTS.areaAnchor.updateColor>', '</ATTACHMENTS.areaAnchor.updateColor>',
            '<svgShow>', 'on=true', '</svgShow>',
            '<ATTACHMENTS.areaAnchor.updateColor>', '</ATTACHMENTS.areaAnchor.updateColor>',
            '<svgShow>', '</svgShow>',
            '<ATTACHMENTS.areaAnchor.updateColor>', '</ATTACHMENTS.areaAnchor.updateColor>',
            '<svgShow>', '</svgShow>',
            '<ATTACHMENTS.areaAnchor.update>', '</ATTACHMENTS.areaAnchor.update>',
            '</execDelayedProcs>'
          ]);
          expect(props1.attachments.length).toBe(0);
          expect(props2.attachments.length).toBe(1);
          expect(attachProps2.boundTargets.length).toBe(1);
          expect(props1.events.cur_line_color.length).toBe(0); // removeEventHandler
          expect(props1.events.svgShow.length).toBe(0); // removeEventHandler
          expect(props2.events.cur_line_color.length).toBe(1);
          expect(props2.events.svgShow.length).toBe(1);

          // unbind 2 -> remove
          traceLog.clear();
          ll2.start = document.getElementById('elm1');
          setTimeout(function() {
            expect(traceLog.log).toEqual([
              '<ATTACHMENTS.areaAnchor.unbind>', '</ATTACHMENTS.areaAnchor.unbind>',
              '<setOptions>', 'needs.position', '</setOptions>',
              '<updatePosition>', 'position_socketXYSE[0]', 'new-position', '</updatePosition>',
              '<updatePath>', 'path_pathData', '</updatePath>',
              '<updateViewBox>', 'x', 'y', 'width', 'height', '</updateViewBox>',
              '<updateMask>',
              'maskBGRect_x', 'maskBGRect_y', 'lineMask_x', 'lineMask_y',
              'capsMaskAnchor_pathDataSE[0]', 'capsMaskAnchor_strokeWidthSE[0]=0',
              '</updateMask>',
              '<update>', 'updated.position', 'updated.path', 'updated.viewBox', 'updated.mask', '</update>',
              '<execDelayedProcs>',
              '<ATTACHMENTS.areaAnchor.updateColor>', '</ATTACHMENTS.areaAnchor.updateColor>',
              '<svgShow>', 'on=false', '</svgShow>',
              '<ATTACHMENTS.areaAnchor.update>', '</ATTACHMENTS.areaAnchor.update>',
              '<removeAttachment>', '<ATTACHMENTS.areaAnchor.remove>', '</ATTACHMENTS.areaAnchor.remove>', '</removeAttachment>',
              '</execDelayedProcs>'
            ]);
            expect(props1.attachments.length).toBe(0);
            expect(props2.attachments.length).toBe(0);
            expect(atc2.isRemoved).toBe(true);
            expect(props1.events.cur_line_color.length).toBe(0); // removeEventHandler
            expect(props1.events.svgShow.length).toBe(0); // removeEventHandler
            expect(props2.events.cur_line_color.length).toBe(0); // removeEventHandler
            expect(props2.events.svgShow.length).toBe(0); // removeEventHandler

            // remove atc -> unbind
            atc1 = window.LeaderLine.areaAnchor({element: document.getElementById('elm1')});
            attachProps1 = window.insAttachProps[atc1._id];
            ll.start = atc1;
            ll2.start = atc1;
            expect(props1.attachments.length).toBe(1);
            expect(props2.attachments.length).toBe(1);
            expect(attachProps1.boundTargets.length).toBe(2);
            expect(props1.events.cur_line_color.length).toBe(1);
            expect(props1.events.svgShow.length).toBe(1);
            expect(props2.events.cur_line_color.length).toBe(1);
            expect(props2.events.svgShow.length).toBe(1);
            traceLog.clear();
            atc1.remove();
            setTimeout(function() {
              expect(traceLog.log).toEqual([
                '<LeaderLineAttachment.remove>',
                '<ATTACHMENTS.pointAnchor.removeOption>', 'start',
                '<ATTACHMENTS.areaAnchor.unbind>', '</ATTACHMENTS.areaAnchor.unbind>',
                '<setOptions>', 'needs.position', '</setOptions>',
                '<updatePosition>', 'position_socketXYSE[0]', 'new-position', '</updatePosition>',
                '<updatePath>', 'path_pathData', '</updatePath>',
                '<updateViewBox>', 'x', 'width', 'height', '</updateViewBox>',
                '<updateMask>',
                'maskBGRect_x', 'lineMask_x', 'capsMaskAnchor_pathDataSE[0]', 'capsMaskAnchor_strokeWidthSE[0]=0',
                '</updateMask>',
                '<update>', 'updated.position', 'updated.path', 'updated.viewBox', 'updated.mask', '</update>',
                '</ATTACHMENTS.pointAnchor.removeOption>',
                '<ATTACHMENTS.pointAnchor.removeOption>', 'start',
                '<ATTACHMENTS.areaAnchor.unbind>', '</ATTACHMENTS.areaAnchor.unbind>',
                '<setOptions>', 'needs.position', '</setOptions>',
                '<updatePosition>', 'position_socketXYSE[0]', 'new-position', '</updatePosition>',
                '<updatePath>', 'path_pathData', '</updatePath>',
                '<updateViewBox>', 'x', 'width', 'height', '</updateViewBox>',
                '<updateMask>',
                'maskBGRect_x', 'lineMask_x', 'capsMaskAnchor_pathDataSE[0]', 'capsMaskAnchor_strokeWidthSE[0]=0',
                '</updateMask>',
                '<update>', 'updated.position', 'updated.path', 'updated.viewBox', 'updated.mask', '</update>',
                '</ATTACHMENTS.pointAnchor.removeOption>',
                '</LeaderLineAttachment.remove>',
                '<execDelayedProcs>',
                '<ATTACHMENTS.areaAnchor.updateColor>', 'color=coral', '</ATTACHMENTS.areaAnchor.updateColor>',
                '<svgShow>', '</svgShow>',
                '<ATTACHMENTS.areaAnchor.updateColor>', '</ATTACHMENTS.areaAnchor.updateColor>',
                '<svgShow>', '</svgShow>',
                '<ATTACHMENTS.areaAnchor.updateColor>', '</ATTACHMENTS.areaAnchor.updateColor>',
                '<svgShow>', '</svgShow>',
                '<ATTACHMENTS.areaAnchor.update>', '</ATTACHMENTS.areaAnchor.update>',
                '<removeAttachment>', '<ATTACHMENTS.areaAnchor.remove>', '</ATTACHMENTS.areaAnchor.remove>', '</removeAttachment>',
                '<ATTACHMENTS.areaAnchor.updateColor>', '</ATTACHMENTS.areaAnchor.updateColor>',
                '<svgShow>', '</svgShow>',
                '<ATTACHMENTS.areaAnchor.update>', '</ATTACHMENTS.areaAnchor.update>',
                '<removeAttachment>', 'not-found', '</removeAttachment>',
                '<LeaderLineAttachment.remove.delayedProc>', '</LeaderLineAttachment.remove.delayedProc>',
                '</execDelayedProcs>'
              ]);
              expect(props1.attachments.length).toBe(0);
              expect(props2.attachments.length).toBe(0);
              expect(atc1.isRemoved).toBe(true);
              expect(props1.events.cur_line_color.length).toBe(0);
              expect(props1.events.svgShow.length).toBe(0);
              expect(props2.events.cur_line_color.length).toBe(0);
              expect(props2.events.svgShow.length).toBe(0);

              // remove ll -> unbind -> remove atc
              atc1 = window.LeaderLine.areaAnchor({element: document.getElementById('elm1')});
              atc2 = window.LeaderLine.areaAnchor({element: document.getElementById('elm2')});
              attachProps1 = window.insAttachProps[atc1._id];
              attachProps2 = window.insAttachProps[atc2._id];
              ll.setOptions({start: atc1, end: atc2});
              expect(props1.attachments.length).toBe(2);
              expect(attachProps1.boundTargets.length).toBe(1);
              expect(attachProps2.boundTargets.length).toBe(1);
              expect(props1.events.cur_line_color.length).toBe(2);
              expect(props1.events.svgShow.length).toBe(2);
              traceLog.clear();
              ll.remove();
              setTimeout(function() {
                expect(traceLog.log).toEqual([
                  '<ATTACHMENTS.areaAnchor.unbind>', '</ATTACHMENTS.areaAnchor.unbind>',
                  '<ATTACHMENTS.areaAnchor.unbind>', '</ATTACHMENTS.areaAnchor.unbind>',
                  '<execDelayedProcs>',
                  '<ATTACHMENTS.areaAnchor.updateColor>', 'color=coral', '</ATTACHMENTS.areaAnchor.updateColor>',
                  '<svgShow>', '</svgShow>',
                  '<ATTACHMENTS.areaAnchor.updateColor>', 'color=coral', '</ATTACHMENTS.areaAnchor.updateColor>',
                  '<svgShow>', '</svgShow>',
                  '<ATTACHMENTS.areaAnchor.updateColor>', '</ATTACHMENTS.areaAnchor.updateColor>',
                  '<svgShow>', '</svgShow>',
                  '<ATTACHMENTS.areaAnchor.update>', '</ATTACHMENTS.areaAnchor.update>',
                  '<removeAttachment>', '<ATTACHMENTS.areaAnchor.remove>', '</ATTACHMENTS.areaAnchor.remove>', '</removeAttachment>',
                  '<ATTACHMENTS.areaAnchor.updateColor>', '</ATTACHMENTS.areaAnchor.updateColor>',
                  '<svgShow>', '</svgShow>',
                  '<ATTACHMENTS.areaAnchor.update>', '</ATTACHMENTS.areaAnchor.update>',
                  '<removeAttachment>', '<ATTACHMENTS.areaAnchor.remove>', '</ATTACHMENTS.areaAnchor.remove>', '</removeAttachment>',
                  '</execDelayedProcs>'
                ]);
                expect(atc1.isRemoved).toBe(true);
                expect(atc2.isRemoved).toBe(true);
                expect(props1.events.cur_line_color.length).toBe(0);
                expect(props1.events.svgShow.length).toBe(0);

                pageDone();
                done();
              }, 50);
            }, 50);
          }, 50);
        }, 50);
      }, 50);
    });

  });

  describe('ATTACHMENTS anchor', function() {

    beforeEach(loadBefore);

    it(registerTitle('pointAnchor-attachOptions'), function(done) {
      var props = window.insProps[ll._id],
        atc;

      // values
      atc = window.LeaderLine.pointAnchor({element: document.getElementById('elm1'), x: 5, y: 6});
      ll.start = atc;
      expect(props.curStats.position_socketXYSE[0].x).toBe(6);
      expect(props.curStats.position_socketXYSE[0].y).toBe(8);
      expect(props.curStats.capsMaskAnchor_pathDataSE[0]).toEqual([
        // elm1 left: 1px; top: 2px;
        {type: 'M', values: [6, 8]},
        {type: 'L', values: [6, 8]},
        {type: 'L', values: [6, 8]},
        {type: 'L', values: [6, 8]},
        {type: 'Z', values: []}
      ]);
      expect(props.curStats.capsMaskAnchor_strokeWidthSE[0]).toBe(0);

      document.getElementById('iframe1').style.borderWidth = '0';
      // iframe1 left: 500px; top: 50px; > elm2 left: 104px; top: 108px;
      atc = window.LeaderLine.pointAnchor({
        element: document.getElementById('iframe1').contentDocument.getElementById('elm2'), x: 5, y: 6});
      ll.start = atc;
      expect(props.curStats.position_socketXYSE[0].x).toBe(609);
      expect(props.curStats.position_socketXYSE[0].y).toBe(164);

      // Percent
      atc = window.LeaderLine.pointAnchor({element: document.getElementById('elm1'), x: '10%', y: '80%'});
      ll.start = atc;
      expect(props.curStats.position_socketXYSE[0].x).toBe(11);
      expect(props.curStats.position_socketXYSE[0].y).toBe(26);
      expect(props.curStats.capsMaskAnchor_pathDataSE[0]).toEqual([
        // elm1 left: 1px; top: 2px;
        {type: 'M', values: [11, 26]},
        {type: 'L', values: [11, 26]},
        {type: 'L', values: [11, 26]},
        {type: 'L', values: [11, 26]},
        {type: 'Z', values: []}
      ]);
      expect(props.curStats.capsMaskAnchor_strokeWidthSE[0]).toBe(0);

      // outside of element
      atc = window.LeaderLine.pointAnchor({element: document.getElementById('elm1'), x: -1, y: -2});
      ll.start = atc;
      expect(props.curStats.position_socketXYSE[0].x).toBe(0);
      expect(props.curStats.position_socketXYSE[0].y).toBe(0);
      expect(props.curStats.capsMaskAnchor_pathDataSE[0]).toEqual([
        // elm1 left: 1px; top: 2px;
        {type: 'M', values: [0, 0]},
        {type: 'L', values: [0, 0]},
        {type: 'L', values: [0, 0]},
        {type: 'L', values: [0, 0]},
        {type: 'Z', values: []}
      ]);
      expect(props.curStats.capsMaskAnchor_strokeWidthSE[0]).toBe(0);

      // outside of element Percent
      atc = window.LeaderLine.pointAnchor({element: document.getElementById('elm1'), x: '150%', y: '180%'});
      ll.start = atc;
      expect(props.curStats.position_socketXYSE[0].x).toBe(151);
      expect(props.curStats.position_socketXYSE[0].y).toBe(56);
      expect(props.curStats.capsMaskAnchor_pathDataSE[0]).toEqual([
        // elm1 left: 1px; top: 2px;
        {type: 'M', values: [151, 56]},
        {type: 'L', values: [151, 56]},
        {type: 'L', values: [151, 56]},
        {type: 'L', values: [151, 56]},
        {type: 'Z', values: []}
      ]);
      expect(props.curStats.capsMaskAnchor_strokeWidthSE[0]).toBe(0);

      pageDone();
      done();
    });

    it(registerTitle('areaAnchor-attachOptions'), function(done) {
      var props = window.insProps[ll._id],
        atc;

      // rect
      atc = window.LeaderLine.areaAnchor({element: document.getElementById('elm1'),
        x: 5, y: 6, width: 7, height: 8, size: 0});
      ll.start = atc;
      expect(props.curStats.position_socketXYSE[0].x).toBe(9.5);
      expect(props.curStats.position_socketXYSE[0].y).toBe(16);
      expect(props.curStats.capsMaskAnchor_pathDataSE[0]).toEqual([
        // elm1 left: 1px; top: 2px;
        {type: 'M', values: [6, 8]},
        {type: 'L', values: [13, 8]},
        {type: 'L', values: [13, 16]},
        {type: 'L', values: [6, 16]},
        {type: 'Z', values: []}
      ]);
      expect(props.curStats.capsMaskAnchor_strokeWidthSE[0]).toBe(0);

      document.getElementById('iframe1').style.borderWidth = '0';
      // iframe1 left: 500px; top: 50px; > elm2 left: 104px; top: 108px;
      atc = window.LeaderLine.areaAnchor({
        element: document.getElementById('iframe1').contentDocument.getElementById('elm2'),
        x: 5, y: 6, width: 7, height: 8, size: 0});
      ll.start = atc;
      expect(props.curStats.position_socketXYSE[0].x).toBe(609);
      expect(props.curStats.position_socketXYSE[0].y).toBe(168);
      expect(props.curStats.capsMaskAnchor_pathDataSE[0]).toEqual([
        {type: 'M', values: [609, 164]},
        {type: 'L', values: [616, 164]},
        {type: 'L', values: [616, 172]},
        {type: 'L', values: [609, 172]},
        {type: 'Z', values: []}
      ]);
      expect(props.curStats.capsMaskAnchor_strokeWidthSE[0]).toBe(0);

      // Percent
      atc = window.LeaderLine.areaAnchor({element: document.getElementById('elm1'),
        x: '10%', y: '80%', width: '20%', height: '50%', size: 0});
      ll.start = atc;
      expect(props.curStats.position_socketXYSE[0].x).toBe(31);
      expect(props.curStats.position_socketXYSE[0].y).toBe(33.5);
      expect(props.curStats.capsMaskAnchor_pathDataSE[0]).toEqual([
        // elm1 left: 1px; top: 2px;
        {type: 'M', values: [11, 26]},
        {type: 'L', values: [31, 26]},
        {type: 'L', values: [31, 41]},
        {type: 'L', values: [11, 41]},
        {type: 'Z', values: []}
      ]);
      expect(props.curStats.capsMaskAnchor_strokeWidthSE[0]).toBe(0);

      pageDone();
      done();
    });

    it(registerTitle('areaAnchor-event auto color'), function(done) {
      var props = window.insProps[ll._id],
        atc, attachProps;

      atc = window.LeaderLine.areaAnchor({element: document.getElementById('elm1')});
      attachProps = window.insAttachProps[atc._id];
      ll.start = atc;
      setTimeout(function() { // `bind` calls setTimeout
        expect(attachProps.curStats.color).toBe('coral');
        expect(props.events.cur_line_color.length).toBe(1); // addEventHandler

        traceLog.clear();
        ll.color = 'red';
        expect(traceLog.log).toEqual([
          '<setOptions>', 'needs.line', '</setOptions>',
          '<updateLine>', 'line_color=red',
          '<ATTACHMENTS.areaAnchor.updateColor>', 'color=red', '</ATTACHMENTS.areaAnchor.updateColor>',
          '</updateLine>',
          '<updatePlug>', 'plug_colorSE[0]=red', 'plug_colorSE[1]=red', '</updatePlug>',
          '<updateLineOutline>', 'not-updated', '</updateLineOutline>',
          '<updatePlugOutline>', 'not-updated', '</updatePlugOutline>',
          '<updateFaces>', 'line_color=red', 'plug_colorSE[1]=red', '</updateFaces>',
          '<updatePosition>',
          '<ATTACHMENTS.areaAnchor.update>', '</ATTACHMENTS.areaAnchor.update>',
          'not-updated',
          '</updatePosition>',
          '<updateViewBox>', 'not-updated', '</updateViewBox>',
          '<updateMask>', 'not-updated', '</updateMask>',
          '<update>', 'updated.line', 'updated.plug', 'updated.faces', '</update>'
        ]);
        expect(attachProps.curStats.color).toBe('red');

        ll.start = document.getElementById('elm1');
        expect(props.events.cur_line_color.length).toBe(0); // removeEventHandler

        pageDone();
        done();
      }, 10);
    });

    it(registerTitle('areaAnchor-event static color'), function(done) {
      var props = window.insProps[ll._id],
        atc, attachProps;

      atc = window.LeaderLine.areaAnchor({element: document.getElementById('elm1'), color: 'blue'});
      attachProps = window.insAttachProps[atc._id];
      ll.start = atc;
      setTimeout(function() { // `bind` calls setTimeout
        expect(attachProps.curStats.color).toBe('blue');
        expect(props.events.cur_line_color == null).toBe(true); // eslint-disable-line eqeqeq

        traceLog.clear();
        ll.color = 'red';
        expect(traceLog.log).toEqual([
          '<setOptions>', 'needs.line', '</setOptions>',
          '<updateLine>', 'line_color=red',
          // ATTACHMENTS.areaAnchor.updateColor is not called
          '</updateLine>',
          '<updatePlug>', 'plug_colorSE[0]=red', 'plug_colorSE[1]=red', '</updatePlug>',
          '<updateLineOutline>', 'not-updated', '</updateLineOutline>',
          '<updatePlugOutline>', 'not-updated', '</updatePlugOutline>',
          '<updateFaces>', 'line_color=red', 'plug_colorSE[1]=red', '</updateFaces>',
          '<updatePosition>',
          '<ATTACHMENTS.areaAnchor.update>', '</ATTACHMENTS.areaAnchor.update>',
          'not-updated',
          '</updatePosition>',
          '<updateViewBox>', 'not-updated', '</updateViewBox>',
          '<updateMask>', 'not-updated', '</updateMask>',
          '<update>', 'updated.line', 'updated.plug', 'updated.faces', '</update>'
        ]);
        expect(attachProps.curStats.color).toBe('blue');

        ll.start = document.getElementById('elm1');
        expect(props.events.cur_line_color == null).toBe(true); // eslint-disable-line eqeqeq

        pageDone();
        done();
      }, 10);
    });

    it(registerTitle('areaAnchor-event auto 1 ll'), function(done) {
      var props = window.insProps[ll._id],
        atc, attachProps;

      atc = window.LeaderLine.areaAnchor({element: document.getElementById('elm1'),
        x: 5, y: 5, width: 10, height: 10}); // (6, 7)-(16, 17)
      attachProps = window.insAttachProps[atc._id];
      ll.start = atc;
      setTimeout(function() { // `bind` calls setTimeout
        expect(attachProps.curStats.color).toBe('coral');
        expect(props.curStats.capsMaskAnchor_strokeWidthSE[0]).toBe(4); // strokeWidth
        expect(props.curStats.capsMaskAnchor_pathDataSE[0]).toEqual([
          {type: 'M', values: [4, 5]},
          {type: 'L', values: [18, 5]},
          {type: 'L', values: [18, 19]},
          {type: 'L', values: [4, 19]},
          {type: 'Z', values: []}
        ]);

        ll.color = 'red';
        ll.size = 8;
        expect(attachProps.curStats.color).toBe('red');
        expect(props.curStats.capsMaskAnchor_strokeWidthSE[0]).toBe(8); // strokeWidth
        expect(props.curStats.capsMaskAnchor_pathDataSE[0]).toEqual([
          {type: 'M', values: [2, 3]},
          {type: 'L', values: [20, 3]},
          {type: 'L', values: [20, 21]},
          {type: 'L', values: [2, 21]},
          {type: 'Z', values: []}
        ]);

        pageDone();
        done();
      }, 10);
    });

    it(registerTitle('areaAnchor-event auto 2 ll'), function(done) {
      var props = window.insProps[ll._id],
        ll2, props2, atc, attachProps;

      atc = window.LeaderLine.areaAnchor({element: document.getElementById('elm1')});
      attachProps = window.insAttachProps[atc._id];
      ll2 = new window.LeaderLine(atc, document.getElementById('elm2'), {color: 'red', size: 8}); // #1
      props2 = window.insProps[ll2._id];
      ll.start = atc; // #2
      setTimeout(function() { // `bind` calls setTimeout
        expect(props.curStats.line_color).toBe('coral'); // check
        expect(props.curStats.line_strokeWidth).toBe(4);
        expect(props2.curStats.line_color).toBe('red');
        expect(props2.curStats.line_strokeWidth).toBe(8);

        expect(attachProps.curStats.color).toBe('red');
        expect(attachProps.curStats.strokeWidth).toBe(8);

        ll.color = 'green';
        ll.size = 10;
        expect(props.curStats.line_color).toBe('green'); // check
        expect(props.curStats.line_strokeWidth).toBe(10);
        // not affected
        expect(attachProps.curStats.color).toBe('red');
        expect(attachProps.curStats.strokeWidth).toBe(8);

        ll2.color = 'yellow';
        ll2.size = 11;
        expect(props2.curStats.line_color).toBe('yellow'); // check
        expect(props2.curStats.line_strokeWidth).toBe(11);
        // affected
        expect(attachProps.curStats.color).toBe('yellow');
        expect(attachProps.curStats.strokeWidth).toBe(11);

        ll2.start = document.getElementById('elm1');
        setTimeout(function() { // `bind` calls setTimeout
          // affected by ll
          expect(attachProps.curStats.color).toBe('green');
          expect(attachProps.curStats.strokeWidth).toBe(10);

          pageDone();
          done();
        }, 10);
      }, 10);
    });

    it(registerTitle('areaAnchor-event svgShow 1 ll'), function(done) {
      var props = window.insProps[ll._id],
        atc, attachProps;

      atc = window.LeaderLine.areaAnchor({element: document.getElementById('elm1')});
      attachProps = window.insAttachProps[atc._id];
      ll.hide('none');
      setTimeout(function() {
        expect(props.isShown).toBe(false); // check

        ll.start = atc;
        setTimeout(function() { // `bind` calls setTimeout
          expect(attachProps.isShown).toBe(false);
          expect(attachProps.svg.style.visibility).toBe('hidden');

          ll.show();
          setTimeout(function() {
            expect(props.isShown).toBe(true); // check

            expect(attachProps.isShown).toBe(true);
            expect(attachProps.svg.style.visibility).toBe('');

            pageDone();
            done();
          }, 100);
        }, 10);
      }, 100);
    });

    it(registerTitle('areaAnchor-event svgShow 2 ll'), function(done) {
      var props = window.insProps[ll._id],
        ll2, props2, atc, attachProps;

      atc = window.LeaderLine.areaAnchor({element: document.getElementById('elm1')});
      attachProps = window.insAttachProps[atc._id];
      ll2 = new window.LeaderLine(atc, document.getElementById('elm2'), {hide: true});
      props2 = window.insProps[ll2._id];
      ll.start = atc;
      setTimeout(function() { // `bind` calls setTimeout
        expect(props.isShown).toBe(true); // check
        expect(props2.isShown).toBe(false);

        expect(attachProps.isShown).toBe(true);
        expect(attachProps.svg.style.visibility).toBe('');

        ll.hide('none');
        setTimeout(function() {
          expect(props.isShown).toBe(false); // check
          expect(props2.isShown).toBe(false);

          expect(attachProps.isShown).toBe(false);
          expect(attachProps.svg.style.visibility).toBe('hidden');

          ll2.show('none');
          setTimeout(function() {
            expect(props.isShown).toBe(false); // check
            expect(props2.isShown).toBe(true);

            expect(attachProps.isShown).toBe(true);
            expect(attachProps.svg.style.visibility).toBe('');

            ll2.start = document.getElementById('elm1');
            setTimeout(function() { // `bind` calls setTimeout
              expect(attachProps.boundTargets.length).toBe(1);
              expect(attachProps.isShown).toBe(false);
              expect(attachProps.svg.style.visibility).toBe('hidden');
              pageDone();
              done();
            }, 10);
          }, 100);
        }, 100);
      }, 10);
    });

    it(registerTitle('areaAnchor-rect'), function(done) {
      var props = window.insProps[ll._id], atc,
        elmX = 1, elmY = 2, elmWidth = 100, elmHeight = 30, // elm1
        rect, r, offset, padding;

      // size: 0, radius: 0
      atc = window.LeaderLine.areaAnchor({element: document.getElementById('elm1'),
        x: 5, y: 6, width: 7, height: 8, size: 0});
      ll.start = atc;
      rect = getRectByXYWH(elmX + 5, elmY + 6, 7, 8);
      expect(props.curStats.capsMaskAnchor_pathDataSE[0]).toEqual([
        {type: 'M', values: [rect.left, rect.top]},
        {type: 'L', values: [rect.right, rect.top]},
        {type: 'L', values: [rect.right, rect.bottom]},
        {type: 'L', values: [rect.left, rect.bottom]},
        {type: 'Z', values: []}
      ]);
      expect(props.curStats.capsMaskAnchor_strokeWidthSE[0]).toBe(0);
      expect(props.curStats.position_socketXYSE[0].x).toBe(rect.left + rect.width / 2); // bottom
      expect(props.curStats.position_socketXYSE[0].y).toBe(rect.bottom);

      // size: 2, radius: 0
      atc = window.LeaderLine.areaAnchor({element: document.getElementById('elm1'),
        x: 5, y: 6, width: 7, height: 8, size: 2});
      ll.start = atc;
      rect = getRectByXYWH(elmX + 5, elmY + 6, 7, 8);
      expect(props.curStats.capsMaskAnchor_pathDataSE[0]).toEqual([
        {type: 'M', values: [rect.left - 1, rect.top - 1]},
        {type: 'L', values: [rect.right + 1, rect.top - 1]},
        {type: 'L', values: [rect.right + 1, rect.bottom + 1]},
        {type: 'L', values: [rect.left - 1, rect.bottom + 1]},
        {type: 'Z', values: []}
      ]);
      expect(props.curStats.capsMaskAnchor_strokeWidthSE[0]).toBe(2);
      expect(props.curStats.position_socketXYSE[0].x).toBe(rect.left + rect.width / 2); // bottom
      expect(props.curStats.position_socketXYSE[0].y).toBe(rect.bottom + 2);

      // Percent size: 5, radius: 0
      atc = window.LeaderLine.areaAnchor({element: document.getElementById('elm1'),
        x: '10%', y: '80%', width: '20%', height: '50%', size: 5});
      ll.start = atc;
      rect = getRectByXYWH(elmX + elmWidth * 0.1, elmY + elmHeight * 0.8, elmWidth * 0.2, elmHeight * 0.5);
      expect(props.curStats.capsMaskAnchor_pathDataSE[0]).toEqual([
        {type: 'M', values: [rect.left - 2.5, rect.top - 2.5]},
        {type: 'L', values: [rect.right + 2.5, rect.top - 2.5]},
        {type: 'L', values: [rect.right + 2.5, rect.bottom + 2.5]},
        {type: 'L', values: [rect.left - 2.5, rect.bottom + 2.5]},
        {type: 'Z', values: []}
      ]);
      expect(props.curStats.capsMaskAnchor_strokeWidthSE[0]).toBe(5);
      expect(props.curStats.position_socketXYSE[0].x).toBe(rect.right + 5); // right
      expect(props.curStats.position_socketXYSE[0].y).toBe(rect.top + rect.height / 2);

      // size: 0, radius: 4
      r = 4;
      atc = window.LeaderLine.areaAnchor({element: document.getElementById('elm1'),
        x: 0, y: 0, width: '100%', height: '100%', size: 0, radius: r});
      ll.start = atc;
      offset = r / Math.SQRT2;
      padding = r - offset;
      rect = getRectByXYWH(elmX, elmY, elmWidth, elmHeight);
      expect(props.curStats.capsMaskAnchor_pathDataSE[0]).toEqual([
        {type: 'M', values: [rect.left - padding, rect.top + offset]},
        {type: 'C', values: [
          rect.left - padding, (rect.top + offset) - r * CIRCLE_CP,
          (rect.left + offset) - r * CIRCLE_CP, rect.top - padding,
          rect.left + offset, rect.top - padding]},
        {type: 'L', values: [rect.right - offset, rect.top - padding]},
        {type: 'C', values: [
          rect.right - offset + r * CIRCLE_CP, rect.top - padding,
          rect.right + padding, (rect.top + offset) - r * CIRCLE_CP,
          rect.right + padding, rect.top + offset]},
        {type: 'L', values: [rect.right + padding, rect.bottom - offset]},
        {type: 'C', values: [
          rect.right + padding, (rect.bottom - offset) + r * CIRCLE_CP,
          (rect.right - offset) + r * CIRCLE_CP, rect.bottom + padding,
          rect.right - offset, rect.bottom + padding]},
        {type: 'L', values: [rect.left + offset, rect.bottom + padding]},
        {type: 'C', values: [
          (rect.left + offset) - r * CIRCLE_CP, rect.bottom + padding,
          rect.left - padding, (rect.bottom - offset) + r * CIRCLE_CP,
          rect.left - padding, rect.bottom - offset]},
        {type: 'L', values: [rect.left - padding, rect.top + offset]},
        {type: 'Z', values: []}
      ]);
      expect(props.curStats.capsMaskAnchor_strokeWidthSE[0]).toBe(0);
      expect(props.curStats.position_socketXYSE[0].x).toBe(rect.right + padding); // right
      expect(props.curStats.position_socketXYSE[0].y).toBe(rect.top + rect.height / 2);

      // size: 4, radius: 5
      r = 5;
      atc = window.LeaderLine.areaAnchor({element: document.getElementById('elm1'),
        x: 0, y: 0, width: '100%', height: '100%', size: 4, radius: r});
      ll.start = atc;
      offset = (r - 2) / Math.SQRT2;
      padding = r - offset;
      rect = getRectByXYWH(elmX, elmY, elmWidth, elmHeight);
      expect(matchPathData(props.curStats.capsMaskAnchor_pathDataSE[0], [
        {type: 'M', values: [rect.left - padding, rect.top + offset]},
        {type: 'C', values: [
          rect.left - padding, (rect.top + offset) - r * CIRCLE_CP,
          (rect.left + offset) - r * CIRCLE_CP, rect.top - padding,
          rect.left + offset, rect.top - padding]},
        {type: 'L', values: [rect.right - offset, rect.top - padding]},
        {type: 'C', values: [
          (rect.right - offset) + r * CIRCLE_CP, rect.top - padding,
          rect.right + padding, (rect.top + offset) - r * CIRCLE_CP,
          rect.right + padding, rect.top + offset]},
        {type: 'L', values: [rect.right + padding, rect.bottom - offset]},
        {type: 'C', values: [
          rect.right + padding, (rect.bottom - offset) + r * CIRCLE_CP,
          (rect.right - offset) + r * CIRCLE_CP, rect.bottom + padding,
          rect.right - offset, rect.bottom + padding]},
        {type: 'L', values: [rect.left + offset, rect.bottom + padding]},
        {type: 'C', values: [
          (rect.left + offset) - r * CIRCLE_CP, rect.bottom + padding,
          rect.left - padding, (rect.bottom - offset) + r * CIRCLE_CP,
          rect.left - padding, rect.bottom - offset]},
        {type: 'L', values: [rect.left - padding, rect.top + offset]},
        {type: 'Z', values: []}
      ])).toBe(true);
      expect(props.curStats.capsMaskAnchor_strokeWidthSE[0]).toBe(4);
      expect(props.curStats.position_socketXYSE[0].x).toBe(rect.right + padding + 2); // right
      expect(Math.abs(props.curStats.position_socketXYSE[0].y - (rect.top + rect.height / 2)))
        .toBeLessThan(TOLERANCE);

      pageDone();
      done();
    });

    it(registerTitle('areaAnchor-circle'), function(done) {
      var props = window.insProps[ll._id], atc,
        elmX = 1, elmY = 2, // elm1
        rect, r, offset, padding,
        rx, ry, offsetX, offsetY, paddingX, paddingY;

      // size: 0, width: 10, height: 10
      atc = window.LeaderLine.areaAnchor({element: document.getElementById('elm1'), shape: 'circle',
        x: 5, y: 6, width: 10, height: 10, size: 0});
      ll.start = atc;
      r = 5 * Math.SQRT2;
      offset = 5;
      padding = r - offset;
      rect = getRectByXYWH(elmX + 5, elmY + 6, 10, 10);
      expect(props.curStats.capsMaskAnchor_pathDataSE[0]).toEqual([
        {type: 'M', values: [rect.left - padding, rect.top + offset]},
        {type: 'C', values: [
          rect.left - padding, (rect.top + offset) - r * CIRCLE_CP,
          (rect.left + offset) - r * CIRCLE_CP, rect.top - padding,
          rect.left + offset, rect.top - padding]},
        {type: 'C', values: [
          rect.right - offset + r * CIRCLE_CP, rect.top - padding,
          rect.right + padding, (rect.top + offset) - r * CIRCLE_CP,
          rect.right + padding, rect.top + offset]},
        {type: 'C', values: [
          rect.right + padding, (rect.bottom - offset) + r * CIRCLE_CP,
          (rect.right - offset) + r * CIRCLE_CP, rect.bottom + padding,
          rect.right - offset, rect.bottom + padding]},
        {type: 'C', values: [
          (rect.left + offset) - r * CIRCLE_CP, rect.bottom + padding,
          rect.left - padding, (rect.bottom - offset) + r * CIRCLE_CP,
          rect.left - padding, rect.bottom - offset]},
        {type: 'Z', values: []}
      ]);
      expect(props.curStats.capsMaskAnchor_strokeWidthSE[0]).toBe(0);
      expect(props.curStats.position_socketXYSE[0].x).toBe(rect.left + rect.width / 2); // bottom
      expect(props.curStats.position_socketXYSE[0].y).toBe(rect.bottom + padding);

      // size: 0, width: 20, height: 10
      atc = window.LeaderLine.areaAnchor({element: document.getElementById('elm1'), shape: 'circle',
        x: 5, y: 6, width: 20, height: 10, size: 0});
      ll.start = atc;
      rx = 10 * Math.SQRT2;
      ry = 5 * Math.SQRT2;
      offsetX = 10;
      offsetY = 5;
      paddingX = rx - offsetX;
      paddingY = ry - offsetY;
      rect = getRectByXYWH(elmX + 5, elmY + 6, 20, 10);
      expect(props.curStats.capsMaskAnchor_pathDataSE[0]).toEqual([
        {type: 'M', values: [rect.left - paddingX, rect.top + offsetY]},
        {type: 'C', values: [
          rect.left - paddingX, (rect.top + offsetY) - ry * CIRCLE_CP,
          (rect.left + offsetX) - rx * CIRCLE_CP, rect.top - paddingY,
          rect.left + offsetX, rect.top - paddingY]},
        {type: 'C', values: [
          rect.right - offsetX + rx * CIRCLE_CP, rect.top - paddingY,
          rect.right + paddingX, (rect.top + offsetY) - ry * CIRCLE_CP,
          rect.right + paddingX, rect.top + offsetY]},
        {type: 'C', values: [
          rect.right + paddingX, (rect.bottom - offsetY) + ry * CIRCLE_CP,
          (rect.right - offsetX) + rx * CIRCLE_CP, rect.bottom + paddingY,
          rect.right - offsetX, rect.bottom + paddingY]},
        {type: 'C', values: [
          (rect.left + offsetX) - rx * CIRCLE_CP, rect.bottom + paddingY,
          rect.left - paddingX, (rect.bottom - offsetY) + ry * CIRCLE_CP,
          rect.left - paddingX, rect.bottom - offsetY]},
        {type: 'Z', values: []}
      ]);
      expect(props.curStats.capsMaskAnchor_strokeWidthSE[0]).toBe(0);
      expect(props.curStats.position_socketXYSE[0].x).toBe(rect.right + paddingX); // right
      expect(props.curStats.position_socketXYSE[0].y).toBe(rect.top + rect.height / 2);

      // size: 0, width: 0, height: 0 -> 10
      atc = window.LeaderLine.areaAnchor({element: document.getElementById('elm1'), shape: 'circle',
        x: 5, y: 6, width: 10, height: 10, size: 0});
      ll.start = atc;
      r = 5 * Math.SQRT2;
      offset = 5;
      padding = r - offset;
      rect = getRectByXYWH(elmX + 5, elmY + 6, 10, 10);
      expect(props.curStats.capsMaskAnchor_pathDataSE[0]).toEqual([
        {type: 'M', values: [rect.left - padding, rect.top + offset]},
        {type: 'C', values: [
          rect.left - padding, (rect.top + offset) - r * CIRCLE_CP,
          (rect.left + offset) - r * CIRCLE_CP, rect.top - padding,
          rect.left + offset, rect.top - padding]},
        {type: 'C', values: [
          rect.right - offset + r * CIRCLE_CP, rect.top - padding,
          rect.right + padding, (rect.top + offset) - r * CIRCLE_CP,
          rect.right + padding, rect.top + offset]},
        {type: 'C', values: [
          rect.right + padding, (rect.bottom - offset) + r * CIRCLE_CP,
          (rect.right - offset) + r * CIRCLE_CP, rect.bottom + padding,
          rect.right - offset, rect.bottom + padding]},
        {type: 'C', values: [
          (rect.left + offset) - r * CIRCLE_CP, rect.bottom + padding,
          rect.left - padding, (rect.bottom - offset) + r * CIRCLE_CP,
          rect.left - padding, rect.bottom - offset]},
        {type: 'Z', values: []}
      ]);
      expect(props.curStats.capsMaskAnchor_strokeWidthSE[0]).toBe(0);
      expect(props.curStats.position_socketXYSE[0].x).toBe(rect.left + rect.width / 2); // bottom
      expect(props.curStats.position_socketXYSE[0].y).toBe(rect.bottom + padding);

      // size: 4, width: 10, height: 10
      atc = window.LeaderLine.areaAnchor({element: document.getElementById('elm1'), shape: 'circle',
        x: 5, y: 6, width: 10, height: 10, size: 4});
      ll.start = atc;
      r = 5 * Math.SQRT2 + 2;
      offset = 5;
      padding = r - offset;
      rect = getRectByXYWH(elmX + 5, elmY + 6, 10, 10);
      expect(props.curStats.capsMaskAnchor_pathDataSE[0]).toEqual([
        {type: 'M', values: [rect.left - padding, rect.top + offset]},
        {type: 'C', values: [
          rect.left - padding, (rect.top + offset) - r * CIRCLE_CP,
          (rect.left + offset) - r * CIRCLE_CP, rect.top - padding,
          rect.left + offset, rect.top - padding]},
        {type: 'C', values: [
          rect.right - offset + r * CIRCLE_CP, rect.top - padding,
          rect.right + padding, (rect.top + offset) - r * CIRCLE_CP,
          rect.right + padding, rect.top + offset]},
        {type: 'C', values: [
          rect.right + padding, (rect.bottom - offset) + r * CIRCLE_CP,
          (rect.right - offset) + r * CIRCLE_CP, rect.bottom + padding,
          rect.right - offset, rect.bottom + padding]},
        {type: 'C', values: [
          (rect.left + offset) - r * CIRCLE_CP, rect.bottom + padding,
          rect.left - padding, (rect.bottom - offset) + r * CIRCLE_CP,
          rect.left - padding, rect.bottom - offset]},
        {type: 'Z', values: []}
      ]);
      expect(props.curStats.capsMaskAnchor_strokeWidthSE[0]).toBe(4);
      expect(props.curStats.position_socketXYSE[0].x).toBe(rect.left + rect.width / 2); // bottom
      expect(props.curStats.position_socketXYSE[0].y).toBe(rect.bottom + padding + 2);

      // size: 4, width: 20, height: 10
      atc = window.LeaderLine.areaAnchor({element: document.getElementById('elm1'), shape: 'circle',
        x: 5, y: 6, width: 20, height: 10, size: 4});
      ll.start = atc;
      rx = 10 * Math.SQRT2 + 2;
      ry = 5 * Math.SQRT2 + 2;
      offsetX = 10;
      offsetY = 5;
      paddingX = rx - offsetX;
      paddingY = ry - offsetY;
      rect = getRectByXYWH(elmX + 5, elmY + 6, 20, 10);
      expect(props.curStats.capsMaskAnchor_pathDataSE[0]).toEqual([
        {type: 'M', values: [rect.left - paddingX, rect.top + offsetY]},
        {type: 'C', values: [
          rect.left - paddingX, (rect.top + offsetY) - ry * CIRCLE_CP,
          (rect.left + offsetX) - rx * CIRCLE_CP, rect.top - paddingY,
          rect.left + offsetX, rect.top - paddingY]},
        {type: 'C', values: [
          rect.right - offsetX + rx * CIRCLE_CP, rect.top - paddingY,
          rect.right + paddingX, (rect.top + offsetY) - ry * CIRCLE_CP,
          rect.right + paddingX, rect.top + offsetY]},
        {type: 'C', values: [
          rect.right + paddingX, (rect.bottom - offsetY) + ry * CIRCLE_CP,
          (rect.right - offsetX) + rx * CIRCLE_CP, rect.bottom + paddingY,
          rect.right - offsetX, rect.bottom + paddingY]},
        {type: 'C', values: [
          (rect.left + offsetX) - rx * CIRCLE_CP, rect.bottom + paddingY,
          rect.left - paddingX, (rect.bottom - offsetY) + ry * CIRCLE_CP,
          rect.left - paddingX, rect.bottom - offsetY]},
        {type: 'Z', values: []}
      ]);
      expect(props.curStats.capsMaskAnchor_strokeWidthSE[0]).toBe(4);
      expect(props.curStats.position_socketXYSE[0].x).toBe(rect.right + paddingX + 2); // right
      expect(props.curStats.position_socketXYSE[0].y).toBe(rect.top + rect.height / 2);

      pageDone();
      done();
    });

    it(registerTitle('areaAnchor-polygon'), function(done) {
      var props = window.insProps[ll._id], atc,
        elmX = 1, elmY = 2, // elm1
        rect, padding;

      // size: 0
      atc = window.LeaderLine.areaAnchor({element: document.getElementById('elm1'), shape: 'polygon',
        points: [[0, 60], [80, 10], [80, 80]], size: 0, fillColor: 'rgba(0, 0, 255, 0.5)'});
      ll.start = atc;
      expect(props.curStats.capsMaskAnchor_pathDataSE[0]).toEqual([
        {type: 'M', values: [elmX + 0, elmY + 60]},
        {type: 'L', values: [elmX + 80, elmY + 10]},
        {type: 'L', values: [elmX + 80, elmY + 80]},
        {type: 'Z', values: []}
      ]);
      expect(props.curStats.capsMaskAnchor_strokeWidthSE[0]).toBe(0);
      rect = getRectByXYRB(elmX + 0, elmY + 10, elmX + 80, elmY + 80);
      padding = 0;
      expect(props.curStats.position_socketXYSE[0].x).toBe(rect.left + rect.width / 2); // bottom
      expect(props.curStats.position_socketXYSE[0].y).toBe(rect.bottom + padding);

      // size: 4
      atc = window.LeaderLine.areaAnchor({element: document.getElementById('elm1'), shape: 'polygon',
        points: [[0, 60], [80, 10], [80, 80]], size: 4, fillColor: 'rgba(0, 0, 255, 0.5)'});
      ll.start = atc;
      expect(props.curStats.capsMaskAnchor_pathDataSE[0]).toEqual([
        {type: 'M', values: [elmX + 0, elmY + 60]},
        {type: 'L', values: [elmX + 80, elmY + 10]},
        {type: 'L', values: [elmX + 80, elmY + 80]},
        {type: 'Z', values: []}
      ]);
      expect(props.curStats.capsMaskAnchor_strokeWidthSE[0]).toBe(4);
      rect = getRectByXYRB(elmX + 0, elmY + 10, elmX + 80, elmY + 80);
      padding = 2;
      expect(props.curStats.position_socketXYSE[0].x).toBe(rect.left + rect.width / 2); // bottom
      expect(props.curStats.position_socketXYSE[0].y).toBe(rect.bottom + padding);

      pageDone();
      done();
    });

  });

  describe('ATTACHMENTS.caption', function() {

    beforeEach(loadBefore);

    it(registerTitle('attachOptions'), function(done) {
      var atc, attachProps;

      // invalid
      atc = window.LeaderLine.caption({text: ' '});
      expect(atc.isRemoved).toBe(true);
      atc = window.LeaderLine.caption({text: 5});
      expect(atc.isRemoved).toBe(true);

      // default
      atc = window.LeaderLine.caption({text: '  label-a  '});
      attachProps = window.insAttachProps[atc._id];
      expect(attachProps.text).toBe('label-a');
      expect(attachProps.color == null).toBe(true); // eslint-disable-line eqeqeq
      expect(attachProps.outlineColor).toBe('#fff');
      expect(attachProps.offset == null).toBe(true); // eslint-disable-line eqeqeq
      expect(attachProps.lineOffset == null).toBe(true); // eslint-disable-line eqeqeq

      // valid
      atc = window.LeaderLine.caption({
        text: '  label-a  ',
        color: ' red ',
        outlineColor: ' blue ',
        offset: [1, 2],
        lineOffset: 3
      });
      attachProps = window.insAttachProps[atc._id];
      expect(attachProps.text).toBe('label-a');
      expect(attachProps.color).toBe('red');
      expect(attachProps.outlineColor).toBe('blue');
      expect(attachProps.offset).toEqual({x: 1, y: 2});
      expect(attachProps.lineOffset).toBe(3);

      pageDone();
      done();
    });

    it(registerTitle('event auto color'), function(done) {
      var props = window.insProps[ll._id],
        atc, attachProps, ll2, props2;

      atc = window.LeaderLine.caption({text: 'label-a'});
      attachProps = window.insAttachProps[atc._id];
      ll.startLabel = atc;
      expect(attachProps.curStats.color).toBe('coral');
      expect(props.events.cur_line_color.length).toBe(1); // addEventHandler
      expect(props.attachments.length).toBe(1);

      // It's changed by updating ll
      traceLog.clear();
      ll.color = 'red';
      expect(traceLog.log).toEqual([
        '<setOptions>', 'needs.line', '</setOptions>',
        '<updateLine>', 'line_color=red',
        '<ATTACHMENTS.caption.updateColor>', 'color=red', '</ATTACHMENTS.caption.updateColor>',
        '</updateLine>',
        '<updatePlug>', 'plug_colorSE[0]=red', 'plug_colorSE[1]=red', '</updatePlug>',
        '<updateLineOutline>', 'not-updated', '</updateLineOutline>',
        '<updatePlugOutline>', 'not-updated', '</updatePlugOutline>',
        '<updateFaces>', 'line_color=red', 'plug_colorSE[1]=red', '</updateFaces>',
        '<updatePosition>', 'not-updated', '</updatePosition>',
        '<updateViewBox>', 'not-updated', '</updateViewBox>',
        '<updateMask>', 'not-updated', '</updateMask>',
        '<update>', 'updated.line', 'updated.plug', 'updated.faces', '</update>'
      ]);
      expect(attachProps.curStats.color).toBe('red');

      // It's changed by binding ll
      ll2 = new window.LeaderLine(document.getElementById('elm1'), document.getElementById('elm3'), {
        color: 'blue'
      });
      props2 = window.insProps[ll2._id];
      traceLog.clear();
      ll2.endLabel = atc;
      expect(traceLog.log).toEqual([
        /* eslint-disable indent */
        // option of ll1
        '<ATTACHMENTS.caption.removeOption>', 'startLabel',
          '<ATTACHMENTS.caption.unbind>', '</ATTACHMENTS.caption.unbind>',
          '<setOptions>', '</setOptions>',
          '<updateViewBox>', 'not-updated', '</updateViewBox>',
          '<updateMask>', 'not-updated', '</updateMask>',
          '<update>', '</update>',
        '</ATTACHMENTS.caption.removeOption>',

        '<ATTACHMENTS.caption.bind>',
          '<ATTACHMENTS.caption.initSvg>',
            '<ATTACHMENTS.caption.updateColor>', 'color=blue', '</ATTACHMENTS.caption.updateColor>',
            '<ATTACHMENTS.caption.updateSocketXY>', 'x=162.09375', 'y=263', '</ATTACHMENTS.caption.updateSocketXY>',
            '<ATTACHMENTS.caption.updateShow>', 'on=true', '</ATTACHMENTS.caption.updateShow>',
          '</ATTACHMENTS.caption.initSvg>',
        '</ATTACHMENTS.caption.bind>',

        '<setOptions>', '</setOptions>',
        '<updateViewBox>', 'not-updated', '</updateViewBox>',
        '<updateMask>', 'not-updated', '</updateMask>',
        '<update>', '</update>'
        /* eslint-enable indent */
      ]);
      expect(attachProps.curStats.color).toBe('blue');
      expect(props.events.cur_line_color.length).toBe(0); // removeEventHandler
      expect(props2.events.cur_line_color.length).toBe(1); // addEventHandler
      expect(props.attachments.length).toBe(0);
      expect(props2.attachments.length).toBe(1);

      traceLog.clear();
      ll2.endLabel = '';
      expect(traceLog.log).toEqual([
        '<ATTACHMENTS.caption.unbind>', '</ATTACHMENTS.caption.unbind>',
        '<setOptions>', '</setOptions>',
        '<updateViewBox>', 'not-updated', '</updateViewBox>',
        '<updateMask>', 'not-updated', '</updateMask>',
        '<update>', '</update>'
      ]);
      expect(props2.events.cur_line_color.length).toBe(0); // removeEventHandler
      expect(props2.attachments.length).toBe(0);
      setTimeout(function() {
        expect(atc.isRemoved).toBe(true);

        pageDone();
        done();
      }, 50);
    });

    it(registerTitle('event static color'), function(done) {
      var props = window.insProps[ll._id],
        atc, attachProps, ll2, props2;

      atc = window.LeaderLine.caption({text: 'label-a', color: 'yellow'});
      attachProps = window.insAttachProps[atc._id];
      ll.startLabel = atc;
      expect(attachProps.curStats.color).toBe('yellow');
      expect(props.events.cur_line_color == null).toBe(true); // eslint-disable-line eqeqeq

      // It's changed by updating ll
      traceLog.clear();
      ll.color = 'red';
      expect(traceLog.log).toEqual([
        '<setOptions>', 'needs.line', '</setOptions>',
        '<updateLine>', 'line_color=red',
        // '<ATTACHMENTS.caption.updateColor>', 'color=red', '</ATTACHMENTS.caption.updateColor>',
        '</updateLine>',
        '<updatePlug>', 'plug_colorSE[0]=red', 'plug_colorSE[1]=red', '</updatePlug>',
        '<updateLineOutline>', 'not-updated', '</updateLineOutline>',
        '<updatePlugOutline>', 'not-updated', '</updatePlugOutline>',
        '<updateFaces>', 'line_color=red', 'plug_colorSE[1]=red', '</updateFaces>',
        '<updatePosition>', 'not-updated', '</updatePosition>',
        '<updateViewBox>', 'not-updated', '</updateViewBox>',
        '<updateMask>', 'not-updated', '</updateMask>',
        '<update>', 'updated.line', 'updated.plug', 'updated.faces', '</update>'
      ]);
      expect(attachProps.curStats.color).toBe('yellow');

      // It's changed by binding ll
      ll2 = new window.LeaderLine(document.getElementById('elm1'), document.getElementById('elm3'), {
        color: 'blue'
      });
      props2 = window.insProps[ll2._id];
      traceLog.clear();
      ll2.endLabel = atc;
      expect(traceLog.log).toEqual([
        /* eslint-disable indent */
        // option of ll1
        '<ATTACHMENTS.caption.removeOption>', 'startLabel',
          '<ATTACHMENTS.caption.unbind>', '</ATTACHMENTS.caption.unbind>',
          '<setOptions>', '</setOptions>',
          '<updateViewBox>', 'not-updated', '</updateViewBox>',
          '<updateMask>', 'not-updated', '</updateMask>',
          '<update>', '</update>',
        '</ATTACHMENTS.caption.removeOption>',

        '<ATTACHMENTS.caption.bind>',
          '<ATTACHMENTS.caption.initSvg>',
            '<ATTACHMENTS.caption.updateColor>', 'color=yellow', '</ATTACHMENTS.caption.updateColor>',
            '<ATTACHMENTS.caption.updateSocketXY>', 'x=162.09375', 'y=263', '</ATTACHMENTS.caption.updateSocketXY>',
            '<ATTACHMENTS.caption.updateShow>', 'on=true', '</ATTACHMENTS.caption.updateShow>',
          '</ATTACHMENTS.caption.initSvg>',
        '</ATTACHMENTS.caption.bind>',

        '<setOptions>', '</setOptions>',
        '<updateViewBox>', 'not-updated', '</updateViewBox>',
        '<updateMask>', 'not-updated', '</updateMask>',
        '<update>', '</update>'
        /* eslint-enable indent */
      ]);
      expect(attachProps.curStats.color).toBe('yellow');
      expect(props.events.cur_line_color == null).toBe(true); // eslint-disable-line eqeqeq
      expect(props2.events.cur_line_color == null).toBe(true); // eslint-disable-line eqeqeq
      expect(props.attachments.length).toBe(0);
      expect(props2.attachments.length).toBe(1);

      traceLog.clear();
      ll2.endLabel = '';
      expect(traceLog.log).toEqual([
        '<ATTACHMENTS.caption.unbind>', '</ATTACHMENTS.caption.unbind>',
        '<setOptions>', '</setOptions>',
        '<updateViewBox>', 'not-updated', '</updateViewBox>',
        '<updateMask>', 'not-updated', '</updateMask>',
        '<update>', '</update>'
      ]);
      expect(props2.events.cur_line_color == null).toBe(true); // eslint-disable-line eqeqeq
      expect(props2.attachments.length).toBe(0);
      setTimeout(function() {
        expect(atc.isRemoved).toBe(true);

        pageDone();
        done();
      }, 50);
    });

    it(registerTitle('event svgShow'), function(done) {
      var props = window.insProps[ll._id],
        atc, attachProps;

      atc = window.LeaderLine.caption({text: 'label-a'});
      attachProps = window.insAttachProps[atc._id];
      ll.hide('none');
      setTimeout(function() {
        expect(props.isShown).toBe(false); // check

        ll.startLabel = atc;
        expect(attachProps.isShown).toBe(false);
        expect(attachProps.styleShow.visibility).toBe('hidden');

        ll.show();
        setTimeout(function() {
          expect(props.isShown).toBe(true); // check

          expect(attachProps.isShown).toBe(true);
          expect(attachProps.styleShow.visibility).toBe('');

          pageDone();
          done();
        }, 100);
      }, 100);
    });

    it(registerTitle('updateSocketXY'), function(done) {
      var props = window.insProps[ll._id],
        atc, attachProps, bBox, width, height, sideLen;

      // offset
      atc = window.LeaderLine.caption({text: 'label-a', offset: [3, -4]});
      attachProps = window.insAttachProps[atc._id];
      ll.startLabel = atc;
      height = (bBox = attachProps.elmPosition.getBBox()).height;
      // elm1 (1, 2) w:100 h:30
      // socket: right (101, 17)
      expect(attachProps.elmPosition.x.baseVal.getItem(0).value).toBe(101 + 3);
      expect(attachProps.elmPosition.y.baseVal.getItem(0).value).toBe(17 - 4 + height);

      // endLabel
      expect(props.attachments.length).toBe(1);
      ll.endLabel = atc;
      // elm3 (216, 232) w:100 h:30
      // socket: left (216, 247)
      expect(attachProps.elmPosition.x.baseVal.getItem(0).value).toBe(216 + 3);
      expect(attachProps.elmPosition.y.baseVal.getItem(0).value).toBe(247 - 4 + height);
      expect(props.attachments.length).toBe(1);

      // move anchor
      document.getElementById('elm3').style.top = '15px';
      // elm3 (216, 15) w:100 h:30
      // socket: left (216, 30)
      ll.position();
      expect(attachProps.elmPosition.x.baseVal.getItem(0).value).toBe(216 + 3);
      expect(attachProps.elmPosition.y.baseVal.getItem(0).value).toBe(30 - 4 + height);

      // auto offset
      atc = window.LeaderLine.caption({text: 'label-a'});
      attachProps = window.insAttachProps[atc._id];
      ll.endLabel = atc;
      width = (bBox = attachProps.elmPosition.getBBox()).width;
      height = bBox.height;
      document.getElementById('elm3').style.left = '300px';
      document.getElementById('elm3').style.top = '300px';
      sideLen = 8;

      document.getElementById('elm1').style.left = '0';
      document.getElementById('elm1').style.top = '250px';
      ll.position();
      // socket: left (300, 315)
      expect(attachProps.elmPosition.x.baseVal.getItem(0).value).toBe(300 - width - height / 2);
      expect(attachProps.elmPosition.y.baseVal.getItem(0).value).toBe(315 + sideLen + height / 2 + height);

      // updated by size
      ll.size = 8;
      sideLen = 16;
      expect(attachProps.elmPosition.x.baseVal.getItem(0).value).toBe(300 - width - height / 2);
      expect(attachProps.elmPosition.y.baseVal.getItem(0).value).toBe(315 + sideLen + height / 2 + height);

      ll.size = 4;
      sideLen = 8;
      document.getElementById('elm1').style.top = '350px';
      ll.position();
      // socket: left (300, 315)
      expect(attachProps.elmPosition.x.baseVal.getItem(0).value).toBe(300 - width - height / 2);
      expect(attachProps.elmPosition.y.baseVal.getItem(0).value).toBe(315 - sideLen - height / 2);

      document.getElementById('elm1').style.left = '600px';
      document.getElementById('elm1').style.top = '250px';
      ll.position();
      // socket: right (400, 315)
      expect(attachProps.elmPosition.x.baseVal.getItem(0).value).toBe(400 + height / 2);
      expect(attachProps.elmPosition.y.baseVal.getItem(0).value).toBe(315 + sideLen + height / 2 + height);

      document.getElementById('elm1').style.top = '350px';
      ll.position();
      // socket: right (400, 315)
      expect(attachProps.elmPosition.x.baseVal.getItem(0).value).toBe(400 + height / 2);
      expect(attachProps.elmPosition.y.baseVal.getItem(0).value).toBe(315 - sideLen - height / 2);

      document.getElementById('elm1').style.left = '250px';
      document.getElementById('elm1').style.top = '0';
      ll.position();
      // socket: top (350, 300)
      expect(attachProps.elmPosition.x.baseVal.getItem(0).value).toBe(350 + sideLen + height / 2);
      expect(attachProps.elmPosition.y.baseVal.getItem(0).value).toBe(300 - height / 2);

      document.getElementById('elm1').style.left = '350px';
      ll.position();
      // socket: top (350, 300)
      expect(attachProps.elmPosition.x.baseVal.getItem(0).value).toBe(350 - sideLen - width - height / 2);
      expect(attachProps.elmPosition.y.baseVal.getItem(0).value).toBe(300 - height / 2);

      document.getElementById('elm1').style.left = '250px';
      document.getElementById('elm1').style.top = '600px';
      ll.position();
      // socket: bottom (350, 330)
      expect(attachProps.elmPosition.x.baseVal.getItem(0).value).toBe(350 + sideLen + height / 2);
      expect(attachProps.elmPosition.y.baseVal.getItem(0).value).toBe(330 + height / 2 + height);

      document.getElementById('elm1').style.left = '350px';
      ll.position();
      // socket: bottom (350, 330)
      expect(attachProps.elmPosition.x.baseVal.getItem(0).value).toBe(350 - sideLen - width - height / 2);
      expect(attachProps.elmPosition.y.baseVal.getItem(0).value).toBe(330 + height / 2 + height);

      pageDone();
      done();
    });

    it(registerTitle('updatePath'), function(done) {
      var props = window.insProps[ll._id],
        atc, attachProps, bBox, width, height, points, point, pointLen;

      atc = window.LeaderLine.caption({text: 'label-a'});
      attachProps = window.insAttachProps[atc._id];
      ll.middleLabel = atc;
      width = (bBox = attachProps.elmPosition.getBBox()).width;
      height = bBox.height;
      expect(props.pathList.baseVal.length).toBe(1);
      expect(props.pathList.baseVal[0].length).toBe(4);
      points = props.pathList.baseVal[0];
      pointLen = window.getCubicLength(points[0], points[1], points[2], points[3]) / 2;
      point = window.getPointOnCubic(points[0], points[1], points[2], points[3],
        window.getCubicT(points[0], points[1], points[2], points[3], pointLen));
      expect(Math.abs(attachProps.elmPosition.x.baseVal.getItem(0).value - (point.x - width / 2)))
        .toBeLessThan(TOLERANCE);
      expect(Math.abs(attachProps.elmPosition.y.baseVal.getItem(0).value - (point.y - height / 2 + height)))
        .toBeLessThan(TOLERANCE);

      // move anchor
      document.getElementById('elm1').style.top = '99px';
      ll.position();
      expect(props.pathList.baseVal.length).toBe(1);
      expect(props.pathList.baseVal[0].length).toBe(4);
      points = props.pathList.baseVal[0];
      pointLen = window.getCubicLength(points[0], points[1], points[2], points[3]) / 2;
      point = window.getPointOnCubic(points[0], points[1], points[2], points[3],
        window.getCubicT(points[0], points[1], points[2], points[3], pointLen));
      expect(Math.abs(attachProps.elmPosition.x.baseVal.getItem(0).value - (point.x - bBox.width / 2)))
        .toBeLessThan(TOLERANCE);
      expect(Math.abs(attachProps.elmPosition.y.baseVal.getItem(0).value - (point.y - height / 2 + height)))
        .toBeLessThan(TOLERANCE);

      // lineOffset
      atc = window.LeaderLine.caption({text: 'label-a', lineOffset: 33});
      attachProps = window.insAttachProps[atc._id];
      ll.middleLabel = atc;
      width = (bBox = attachProps.elmPosition.getBBox()).width;
      height = bBox.height;
      expect(props.pathList.baseVal.length).toBe(1);
      expect(props.pathList.baseVal[0].length).toBe(4);
      points = props.pathList.baseVal[0];
      pointLen = window.getCubicLength(points[0], points[1], points[2], points[3]) / 2 + 33;
      point = window.getPointOnCubic(points[0], points[1], points[2], points[3],
        window.getCubicT(points[0], points[1], points[2], points[3], pointLen));
      expect(Math.abs(attachProps.elmPosition.x.baseVal.getItem(0).value - (point.x - width / 2)))
        .toBeLessThan(TOLERANCE);
      expect(Math.abs(attachProps.elmPosition.y.baseVal.getItem(0).value - (point.y - height / 2 + height)))
        .toBeLessThan(TOLERANCE);

      pageDone();
      done();
    });

  });

});
