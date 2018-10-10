/* xlsx.js (C) 2013-2015 SheetJS -- http://sheetjs.com */
/* uncomment the next line for encoding support */
//importScripts('dist/cpexcel.js');
importScripts('https://cdn.bootcss.com/xlsx/0.8.0/jszip.js');
importScripts('https://cdn.bootcss.com/xlsx/0.8.0/xlsx.full.min.js');
/* uncomment the next line for ODS support */
importScripts('https://cdn.bootcss.com/xlsx/0.8.0/ods.js');
postMessage({t:"ready"});

function ab2str(data) {
	var o = "", l = 0, w = 10240;
	for(; l<data.byteLength/w; ++l) o+=String.fromCharCode.apply(null,new Uint16Array(data.slice(l*w,l*w+w)));
	o+=String.fromCharCode.apply(null, new Uint16Array(data.slice(l*w)));
	return o;
}

function s2ab(s) {
  var b = new ArrayBuffer(s.length*2), v = new Uint16Array(b);
  for (var i=0; i != s.length; ++i) v[i] = s.charCodeAt(i);
  return [v, b];
}

onmessage = function (oEvent) {
  var v;
  try {
    v = XLSX.read(ab2str(oEvent.data), {type: 'binary'});
  } catch(e) { postMessage({t:"e",d:e.stack}); }
  var res = {t:"xlsx", d:JSON.stringify(v)};
  var r = s2ab(res.d)[1];
  postMessage(r, [r]);
};
