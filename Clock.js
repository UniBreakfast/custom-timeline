{
  var Clock = class {
    constructor (parent) {
      const clock = render(parent)
      this.elems = {
        clock,
        weekday: clock.querySelector('.weekday'),
        date: clock.querySelector('.date'),
        time: clock.querySelector('.time'),
        ms: clock.querySelector('.ms'),
      }
    }

    update(dt) {
      const {weekday, date, time, ms} = this.elems

      weekday.innerText = ['Sunday','Monday','Tuesday','Wednesday',
                                    'Thursday','Friday','Saturday'][dt.getDay()]

      date.innerText = `${dt.getFullYear()} - ${
        String(dt.getMonth()+1).padStart(2, 0)} - ${
          String(dt.getDate()).padStart(2, 0)}`

      time.innerText = `${String(dt.getHours()).padStart(2, 0)}:${
        String(dt.getMinutes()).padStart(2, 0)}:${
          String(dt.getSeconds()).padStart(2, 0)} `

      ms.innerText = String(dt.getMilliseconds()).padStart(3, 0)
      time.append(ms)
    }
  }

  const render = parent => {
    const clock = document.createElement('div')
    parent.append(clock)
    clock.outerHTML = `
      <div class="clock">
        <div class="weekday">Wednesday</div>
        <div class="date">2020 - 08 - 16</div>
        <div class="time">14:08:11. <span class="ms">710</span></div>
      </div>
    `
    return parent.lastElementChild
  }

}