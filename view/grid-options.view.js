import ham from 'https://hamilsauce.github.io/hamhelper/hamhelper1.0.0.js';
const { template, utils, DOM, event } = ham;
console.log('event', event)
const GRID_OPTIONS_CONFIG = [
  {
    name: 'width',
    label: 'Width',
    type: 'text',
    value: 15,
  },
  {
    name: 'height',
    label: 'Height',
    type: 'text',
    value: 15,
  },
  {
    name: 'unitSize',
    label: 'Size',
    type: 'text',
    value: 1,
  },
]

export const gridOptions = DOM.createElement({
    templateName: 'grid-options',
    elementProperties: {
      onclick: (e) => {
        const opt = e.target.closest('.grid-option')
      if (!opt) return;
      opt.querySelector('input').focus();
      event.selectAllContent(opt.querySelector('input'))
        console.warn('onclick', e)
      }
    }
  },
  GRID_OPTIONS_CONFIG.map((opt) => {
    const o = template('grid-option')
    const l = o.querySelector('label');
    const i = o.querySelector('input');
    o.dataset.optionName = opt.name
    l.textContent = opt.label;
    i.type = opt.type;
    i.value = opt.value;

    return o;
  })
);

gridOptions.addEventListener('change', e => {
  const targ = e.target.closest('input');
  const opt = targ.closest('.grid-option');
  const optionName = opt.dataset.optionName;
  const value = !isNaN(+targ.value.trim()) ? +e.target.closest('input').value.trim() : 0;

  gridOptions.dispatchEvent(new CustomEvent('option:change', { bubbles: true, detail: { name: optionName, value } }))
});



// appHeader.append(gridOptions)
