(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[815],{9815:function(e,n,t){"use strict";t.r(n),t.d(n,{default:function(){return U}});var r,u,o,l,i,a,c=t(7437),s=t(2265);let f=(0,s.createContext)(null),p=f.Provider;function d(){let e=(0,s.useContext)(f);if(null==e)throw Error("No context provided: useLeafletContext() can only be used in a descendant of <MapContainer>");return e}var m=t(759),v=t.n(m);function x(){return(x=Object.assign||function(e){for(var n=1;n<arguments.length;n++){var t=arguments[n];for(var r in t)Object.prototype.hasOwnProperty.call(t,r)&&(e[r]=t[r])}return e}).apply(this,arguments)}let h=(0,s.forwardRef)(function({bounds:e,boundsOptions:n,center:t,children:r,className:u,id:o,placeholder:l,style:i,whenReady:a,zoom:c,...f},d){let[v]=(0,s.useState)({className:u,id:o,style:i}),[h,b]=(0,s.useState)(null);(0,s.useImperativeHandle)(d,()=>h?.map??null,[h]);let k=(0,s.useCallback)(r=>{if(null!==r&&null===h){let u=new m.Map(r,f);null!=t&&null!=c?u.setView(t,c):null!=e&&u.fitBounds(e,n),null!=a&&u.whenReady(a),b(Object.freeze({__version:1,map:u}))}},[]);(0,s.useEffect)(()=>()=>{h?.map.remove()},[h]);let y=h?s.createElement(p,{value:h},r):l??null;return s.createElement("div",x({},v,{ref:k}),y)});var b=t(4887);function k(e,n,t){return Object.freeze({instance:e,context:n,container:t})}function y(e,n){return null==n?function(n,t){let r=(0,s.useRef)();return r.current||(r.current=e(n,t)),r}:function(t,r){let u=(0,s.useRef)();u.current||(u.current=e(t,r));let o=(0,s.useRef)(t),{instance:l}=u.current;return(0,s.useEffect)(function(){o.current!==t&&(n(l,t,o.current),o.current=t)},[l,t,r]),u}}function g(e,n){let t=(0,s.useRef)(n);(0,s.useEffect)(function(){n!==t.current&&null!=e.attributionControl&&(null!=t.current&&e.attributionControl.removeAttribution(t.current),null!=n&&e.attributionControl.addAttribution(n)),t.current=n},[e,n])}function _(e,n){let t=(0,s.useRef)();(0,s.useEffect)(function(){return null!=n&&e.instance.on(n),t.current=n,function(){null!=t.current&&e.instance.off(t.current),t.current=null}},[e,n])}function j(e,n){let t=e.pane??n.pane;return t?{...e,pane:t}:e}function M(e){return function(n){var t;let r=d(),u=e(j(n,r),r);return g(r.map,n.attribution),_(u.current,n.eventHandlers),t=u.current,(0,s.useEffect)(function(){return(r.layerContainer??r.map).addLayer(t.instance),function(){r.layerContainer?.removeLayer(t.instance),r.map.removeLayer(t.instance)}},[r,t]),u}}let w=(r=M(y(function({url:e,...n},t){return k(new m.TileLayer(e,j(n,t)),t)},function(e,n,t){!function(e,n,t){let{opacity:r,zIndex:u}=n;null!=r&&r!==t.opacity&&e.setOpacity(r),null!=u&&u!==t.zIndex&&e.setZIndex(u)}(e,n,t);let{url:r}=n;null!=r&&r!==t.url&&e.setUrl(r)})),(0,s.forwardRef)(function(e,n){let{instance:t}=r(e).current;return(0,s.useImperativeHandle)(n,()=>t),null})),C=(u=M(y(function({position:e,...n},t){var r;let u=new m.Marker(e,n);return k(u,(r={overlayContainer:u},Object.freeze({...t,...r})))},function(e,n,t){n.position!==t.position&&e.setLatLng(n.position),null!=n.icon&&n.icon!==t.icon&&e.setIcon(n.icon),null!=n.zIndexOffset&&n.zIndexOffset!==t.zIndexOffset&&e.setZIndexOffset(n.zIndexOffset),null!=n.opacity&&n.opacity!==t.opacity&&e.setOpacity(n.opacity),null!=e.dragging&&n.draggable!==t.draggable&&(!0===n.draggable?e.dragging.enable():e.dragging.disable())})),(0,s.forwardRef)(function(e,n){let{instance:t,context:r}=u(e).current;return(0,s.useImperativeHandle)(n,()=>t),null==e.children?null:s.createElement(p,{value:r},e.children)})),S=(o=function(e,n){return k(new m.Popup(e,n.overlayContainer),n)},l=function(e,n,{position:t},r){(0,s.useEffect)(function(){let{instance:u}=e;function o(e){e.popup===u&&(u.update(),r(!0))}function l(e){e.popup===u&&r(!1)}return n.map.on({popupopen:o,popupclose:l}),null==n.overlayContainer?(null!=t&&u.setLatLng(t),u.openOn(n.map)):n.overlayContainer.bindPopup(u),function(){n.map.off({popupopen:o,popupclose:l}),n.overlayContainer?.unbindPopup(),n.map.removeLayer(u)}},[e,n,r,t])},i=y(o),a=function(e,n){let t=d(),r=i(j(e,t),t);return g(t.map,e.attribution),_(r.current,e.eventHandlers),l(r.current,t,e,n),r},(0,s.forwardRef)(function(e,n){let[t,r]=(0,s.useState)(!1),{instance:u}=a(e,r).current;(0,s.useImperativeHandle)(n,()=>u),(0,s.useEffect)(function(){t&&u.update()},[u,t,e.children]);let o=u._contentNode;return o?(0,b.createPortal)(e.children,o):null}));var z=t(6527),I=t.n(z),N=t(6039);let O=v().divIcon({className:I().busStopMarker,iconSize:[15,15],iconAnchor:[7.5,7.5]}),E=v().divIcon({className:I().selectedBusStopMarker,iconSize:[20,20],iconAnchor:[10,10]}),L=e=>{let{stop:n,isSelected:t,onClick:r}=e,u=[n.latitude,n.longitude];return(0,c.jsx)(C,{position:u,icon:t?E:O,eventHandlers:{click:r},children:(0,c.jsx)(S,{children:(0,c.jsxs)("div",{className:"p-2",children:[(0,c.jsx)("h3",{className:"font-medium mb-1",children:n.name}),void 0!==n.distance&&(0,c.jsxs)("p",{className:"text-sm text-muted-foreground mb-2",children:["Distance: ",(0,N.B)(n.distance)]}),n.municipality&&(0,c.jsx)("p",{className:"text-sm text-muted-foreground",children:n.municipality})]})})})},R=v().divIcon({className:I().lineStopMarker,iconSize:[12,12],iconAnchor:[6,6]}),H=e=>{let{stop:n,onClick:t}=e,r=[n.latitude,n.longitude];return(0,c.jsx)(C,{position:r,icon:R,eventHandlers:{click:t},children:(0,c.jsx)(S,{children:(0,c.jsxs)("div",{className:"p-2",children:[(0,c.jsx)("h3",{className:"font-medium mb-1",children:n.name}),n.municipality&&(0,c.jsx)("p",{className:"text-sm text-muted-foreground",children:n.municipality})]})})})},A=v().divIcon({className:I().userLocationMarker,iconSize:[20,20],iconAnchor:[10,10]}),P=e=>{let{position:n}=e;return(0,c.jsx)(C,{position:n,icon:A})};function B(e){let{center:n,zoom:t}=e,r=d().map;return(0,s.useEffect)(()=>{r.setView(n,t)},[r,n,t]),null}var U=e=>{let{center:n,zoom:t,busStops:r,selectedStop:u,onStopSelect:o,lineStops:l,onMapInit:i}=e,a=(0,s.useRef)(null);return(0,s.useEffect)(()=>{a.current&&i(a.current)},[i]),(0,c.jsxs)(h,{center:n,zoom:t,className:"h-full w-full",ref:a,children:[(0,c.jsx)(B,{center:n,zoom:t}),(0,c.jsx)(w,{attribution:'\xa9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',url:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}),(0,c.jsx)(P,{position:n}),r.map(e=>(0,c.jsx)(L,{stop:e,isSelected:(null==u?void 0:u.id)===e.id,onClick:()=>o(e)},e.id)),l.map(e=>(0,c.jsx)(H,{stop:e,onClick:()=>o(e)},e.id))]})}},6527:function(e){e.exports={userMarker:"Markers_userMarker__n9faV",busStopMarker:"Markers_busStopMarker__wJhO6",selectedBusStopMarker:"Markers_selectedBusStopMarker__0jCZR",lineStopMarker:"Markers_lineStopMarker__ueY_e",userLocationMarker:"Markers_userLocationMarker__zSnWL",pulse:"Markers_pulse__UA4TU"}}}]);