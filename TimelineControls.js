{
  var TimelineControls = class extends EventTarget {
    constructor (parent) {
      super()

      const controls = render(parent)
      const sliderBox = controls.querySelector('.slider')
      const sliderInput = sliderBox.querySelector('input[type="range"]')
      const runBtn = controls.querySelector('[value="run"]')
      const freezeBtn = controls.querySelector('[value="freeze"]')
      const perSecBtn = controls.querySelector('[value="sec"]')
      const dayPerBtn = controls.querySelector('[value="day"]')
      const customSpeedBtn = controls.querySelector('[value="custom"]')
      this.elems = { controls, sliderBox, sliderInput, runBtn, freezeBtn,
                    perSecBtn, dayPerBtn, customSpeedBtn }

      Object.setPrototypeOf(sliderBox, TimelineControlsSliderElement.prototype)
      
      sliderInput.addEventListener('change', () => {
        if (customSpeedBtn.classList.contains('actual')) {
          customSpeedBtn.value = sliderBox.value
          this.labelCustom()
        } else this.switchActual(sliderBox)

        const e = this.triggerChange()
        sliderBox.dispatchEvent(e)
      })

      controls.addEventListener('click', e => {
        if (e.target.tagName == 'BUTTON') {
          if (!e.target.value) return

          if ('run freeze'.includes(e.target.value)) {
            if (!e.target.classList.contains('selected')) {
              runBtn.classList.toggle('selected')
              freezeBtn.classList.toggle('selected')
            }
            this.toggle(e.target.value)

          } else if (
            'sec day'.includes(e.target.value) && 
            !e.target.classList.contains('selected')
          ) {
            perSecBtn.classList.toggle('selected')
            dayPerBtn.classList.toggle('selected')
            this.triggerChange()

          } else if ('+-'.includes(e.target.value[0])) {
            if (customSpeedBtn.classList.contains('actual')) {
              customSpeedBtn.value -= -e.target.value
              this.labelCustom()
              this.triggerChange()
            } else this.triggerShift(e.target.value)

          } else if (!Number.isNaN(+e.target.value)) {
            if (e.target != customSpeedBtn 
                && customSpeedBtn.classList.contains('actual')) {
              customSpeedBtn.value = e.target.value
              this.labelCustom()
            } else this.switchActual(e.target)
            this.triggerChange()

          } else if (e.target == customSpeedBtn) {
            const actual = this.elems.controls.querySelector('.actual')
            if (actual)  customSpeedBtn.value = actual.value
            this.switchActual(customSpeedBtn)
            this.labelCustom()
          }
        }
      })
    }

    triggerChange() {
      const e = new Event('change')
      this.dispatchEvent(e)
      this.elems.controls.dispatchEvent(e)
      return e
    }

    triggerShift(value) {
      this.dispatchEvent(new CustomEvent('shift', {detail: value}))
    }

    toggle(state) {
      this.dispatchEvent(new CustomEvent('toggle', {detail: state}))
    }
    
    switchActual(el) {
      const actual = this.elems.controls.querySelector('.actual')
      if (actual == el) {
        if (el == this.elems.customSpeedBtn) {
          el.classList.remove('actual')
          this.elems.controls.querySelector('[value="1"]')
            .classList.add('actual')
        }
      } else {
        if (actual) actual.classList.remove('actual')
        el.classList.add('actual')
      } 
    }

    labelCustom() {
      const btn = this.elems.customSpeedBtn
      let { value } = btn
      value = Math.floor(value)
      const days = value / 864e5 | 0
      value %= 864e5
      const hours = value / 36e5 | 0
      value %= 36e5
      const mins = value / 60000 | 0
      const ms = value % 60000
      let label = ''
      if (days) label += days + '&nbsp;day(s) '
      if (hours) label += hours + '&nbsp;hour(s) '
      if (mins) label += mins + '&nbsp;min(s) '
      if (ms) label += ms + '&nbsp;ms'
      btn.innerHTML = label
    }
  }

  const render = parent => {
    let controls = document.createElement('div')
    parent.append(controls)
    controls.outerHTML = `
      <div class="timeline-controls">
        <div>
          <button class='big selected' value='run'>run</button>
          <button class='big' value='freeze'>freeze</button>
        </div>
        <div>
          <div class="button-bar">
            <div>
              <button class='small' value="+1">+</button>
              <button class='big' value="1">ms</button>
              <button class='small' value="-1">-</button>
            </div>
            <div>
              <button class='small' value="+1000">+</button>
              <button class='big actual' value="1000">sec</button>
              <button class='small' value="-1000">-</button>
            </div>
            <div>
              <button class='small' value="+60000">+</button>
              <button class='big' value="60000">min</button>
              <button class='small' value="-60000">-</button>
            </div>
            <div>
              <button class='small' value="+36e5">+</button>
              <button class='big' value="36e5">hour</button>
              <button class='small' value="-36e5">-</button>
            </div>
            <div>
              <button class='small' value="+864e5">+</button>
              <button class='big' value="864e5">day</button>
              <button class='small' value="-864e5">-</button>
            </div>
            <div>
              <button class='small' value="+6048e5">+</button>
              <button class='big' value="6048e5">week</button>
              <button class='small' value="-6048e5">-</button>
            </div>
            <div>
              <button class='small' value="+2629756800">+</button>
              <button class='big' value="2629756800">month</button>
              <button class='small' value="-2629756800">-</button>
            </div>
            <div>
              <button class='small' value="+31557081600">+</button>
              <button class='big' value="31557081600">year</button>
              <button class='small' value="-31557081600">-</button>
            </div>
          </div>
          <div class="slider">
            <input type="range" value="1159" min="0" max="9999">
          </div>
        </div>
        <div>
          <button class='small' value='day'>day per</button>
          <button class='big custom' value='custom'>custom speed</button>
          <button class='small selected' value='sec'>per sec</button>
        </div>
      </div>
    `
    controls = parent.lastElementChild
    Object.setPrototypeOf(controls, TimelineControlsDivElement.prototype)
    return controls
  }

  class TimelineControlsDivElement extends HTMLDivElement {
    constructor () {
      const div = document.createElement('div')
      Object.setPrototypeOf(div, TimelineControlsDivElement.prototype)
      return div
    }
  
    get value() {
      const relevantControl = this.querySelector('.actual')
      if (!relevantControl) return 0
      return this.querySelector('[value="sec"].selected') ? 
        relevantControl.value / 1000 : 864e5 / relevantControl.value
    }
  }

  const secMark = 0.116,  minMark = 0.244,  hourMark = 0.382,
        dayMark = 0.518,  weekMark = 0.663,  monthMark = 0.829

  class TimelineControlsSliderElement extends HTMLInputElement {
    constructor () {
      const slider = document.createElement('input')
      Object.setPrototypeOf(slider, TimelineControlsSliderElement.prototype)
      return slider
    }
  
    get value() {
      const slider = this.querySelector('input[type="range"]')
      if (!slider)  return ''
      const mark = slider.value / slider.max

      if (mark < secMark)
        return 999 * (mark / secMark) + 1
      if (mark < minMark)
        return 59000 * ((mark - secMark) / (minMark - secMark)) + 1000
      if (mark < hourMark)
        return 3540000 * ((mark - minMark) / (hourMark - minMark)) + 60000
      if (mark < dayMark)
        return 82800000 * ((mark - hourMark) / (dayMark - hourMark)) + 36e5
      if (mark < weekMark)
        return 518400000 * ((mark - dayMark) / (weekMark - dayMark)) + 864e5
      if (mark < monthMark)
        return 2024956800 * ((mark - weekMark) / (monthMark - weekMark)) 
          + 6048e5
      return 28927324800 * ((mark - monthMark) / (1 - monthMark)) 
        + 2629756800
    }
  }
}

