
const timeRows= document.querySelectorAll('.time-row')

timeRows.forEach(row => {

  const myTimeline = Date.customTimeline(/* {current: new Date, speed: 30, updInterval: 111, running: false} */)
  const myTimelineControls = new TimelineControls(row)
  const myClock = new Clock(row)

  myTimeline.addEventListener('update', e => myClock.update(e.detail))

  myTimelineControls.addEventListener('toggle', e => myTimeline[e.detail]())
  myTimelineControls.addEventListener('shift', e => myTimeline.shift(+e.detail))
  myTimelineControls.addEventListener('change', 
    () => myTimeline.speed = myTimelineControls.elems.controls.value)

})



