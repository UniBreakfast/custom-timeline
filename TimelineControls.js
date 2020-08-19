{
  var TimelineControls = class extends EventTarget {
    constructor (parent) {
      super()

      const controls = render(parent)
      const buttonBar = controls.querySelector('.button-bar')
      const sliderBox = controls.querySelector('.slider')
      const sliderInput = sliderBox.querySelector('input[type="range"]')
      const runBtn = controls.querySelector('[value="run"]')
      const freezeBtn = controls.querySelector('[value="freeze"]')
      const perSecBtn = controls.querySelector('[value="sec"]')
      const dayPerBtn = controls.querySelector('[value="day"]')
      const customSpeedBtn = controls.querySelector('[value="custom"]')
      this.elems = { controls, buttonBar, runBtn, freezeBtn, sliderBox,
                     sliderInput, perSecBtn, dayPerBtn, customSpeedBtn }

      Object.setPrototypeOf(sliderBox, TimelineControlsSliderElement.prototype)
      
      sliderInput.addEventListener('input', () => {
        const { label } = sliderInput.dataset
        if (freezeBtn.classList.contains('selected') && label!='custom speed') {
          const { value } = sliderInput
          const units = label.split(' ')[1]
          if (+value < 0) 
            sliderInput.dataset.label = `${value} ${units} +`
          else if (+value > 0)
            sliderInput.dataset.label = `- ${units} +${value}`
        }
      })

      sliderInput.addEventListener('change', () => {
        const label = sliderInput.dataset.label
        if (freezeBtn.classList.contains('selected') && label!='custom speed') {
          const step = 
            buttonBar.querySelector(`.${label.split(' ')[1]} .big`).value
          this.triggerShift(sliderInput.value * step)
          sliderInput.value = 0
          sliderInput.dataset.label = `- ${label.split(' ')[1]} +`
        } else if (customSpeedBtn.classList.contains('actual')) {
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
            sliderInput.dataset.label = 'custom speed'
            sliderInput.min = 0
            sliderInput.max = 9999
            sliderInput.setAttribute('list', 'speed-slider-marks')
            sliderInput.value = 0
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

      buttonBar.addEventListener('mouseover', e => {
        if (!freezeBtn.classList.contains('selected')) return

        const parent = e.target.parentElement
        if (parent.parentElement != buttonBar) return

        const list = parent.querySelector('datalist')
        sliderInput.dataset.label = `- ${parent.className} +`
        sliderInput.min = list.options[0].value
        sliderInput.max = list.options[list.options.length - 1].value
        sliderInput.setAttribute('list', list.id)
        sliderInput.value = 0

        sliderBox.classList.remove('actual')
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
      if (!label) label = 'zero speed, might as well freeze'
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
            <div class="milliseconds">
              <button class='small' value="+1">+</button>
              <button class='big' value="1">ms</button>
              <button class='small' value="-1">-</button>
              <datalist id="milliseconds-marks">
                ${[...Array(101).keys()]
                 .map(i => `<option value="${(i - 50)*10}"></option>`).join('')}
              </datalist>
            </div>
            <div class="seconds">
              <button class='small' value="+1000">+</button>
              <button class='big actual' value="1000">sec</button>
              <button class='small' value="-1000">-</button>
              <datalist id="seconds-marks">
                ${[...Array(61).keys()]
                  .map(i => `<option value="${i - 30}"></option>`).join('')}
              </datalist>
            </div>
            <div class="munutes">
              <button class='small' value="+60000">+</button>
              <button class='big' value="60000">min</button>
              <button class='small' value="-60000">-</button>
              <datalist id="munutes-marks">
                ${[...Array(61).keys()]
                  .map(i => `<option value="${i - 30}"></option>`).join('')}
              </datalist>
            </div>
            <div class="hours">
              <button class='small' value="+36e5">+</button>
              <button class='big' value="36e5">hour</button>
              <button class='small' value="-36e5">-</button>
              <datalist id="hours-marks">
                ${[...Array(25).keys()]
                  .map(i => `<option value="${i - 12}"></option>`).join('')}
              </datalist>
            </div>
            <div class="days">
              <button class='small' value="+864e5">+</button>
              <button class='big' value="864e5">day</button>
              <button class='small' value="-864e5">-</button>
              <datalist id="days-marks">
                ${[...Array(29).keys()]
                  .map(i => `<option value="${i - 14}"></option>`).join('')}
              </datalist>
            </div>
            <div class="weeks">
              <button class='small' value="+6048e5">+</button>
              <button class='big' value="6048e5">week</button>
              <button class='small' value="-6048e5">-</button>
              <datalist id="weeks-marks">
                ${[...Array(17).keys()]
                  .map(i => `<option value="${i - 8}"></option>`).join('')}
              </datalist>
            </div>
            <div class="months">
              <button class='small' value="+2629756800">+</button>
              <button class='big' value="2629756800">month</button>
              <button class='small' value="-2629756800">-</button>
              <datalist id="months-marks">
                ${[...Array(13).keys()]
                  .map(i => `<option value="${i - 6}"></option>`).join('')}
              </datalist>
            </div>
            <div class="years">
              <button class='small' value="+31557081600">+</button>
              <button class='big' value="31557081600">year</button>
              <button class='small' value="-31557081600">-</button>
              <datalist id="years-marks">
                ${[...Array(21).keys()]
                  .map(i => `<option value="${i - 10}"></option>`).join('')}
              </datalist>
            </div>
          </div>
          <div class="slider">
            <input type="range" value="1159" min="0" max="9999" 
              list="speed-slider-marks" data-label="custom speed">
            <datalist id="speed-slider-marks">
              <option value="1160"></option>
              <option value="2440"></option>
              <option value="3820"></option>
              <option value="5179"></option>
              <option value="6629"></option>
              <option value="8289"></option>
            </datalist>
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
      if (!relevantControl || !+relevantControl.value) return 0
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

      switch (slider.value) {
        case "1160": return 1000
        case "2440": return 60000
        case "3820": return 36e5
        case "5179": return 864e5
        case "6629": return 6048e5
        case "8289": return 2629756800
      }

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

