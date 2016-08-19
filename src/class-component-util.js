import {initAt, initAllAtElem} from './class-component-manager'
import {COELEMENT_DATA_KEY_PREFIX} from './const'

/**
 * Initializes the element if it has registered class component names. Returns the jquery object itself.
 * @param {jQuery} elem The element (jQuery selection)
 * @param {string} [classNames] The class name.
 * @return {jQuery}
 */
export function componentInit (elem, classNames) {
  if (classNames) {
    classNames.split(/\s+/).forEach(className => {
      initAt(className, elem.addClass(className)) // init as the class-component
    })
  } else {
    // Initializes anything it already has.
    initAllAtElem(elem)
  }
}

/**
 * Gets the coelement of the given name in the given element.
 * @param {jQuery} elem The elemenet (jQuery selection)
 * @param {String} coelementName The name of the coelement
 * @return {Object}
 */
export function componentGet (elem, coelementName) {
  const coelement = elem.data(COELEMENT_DATA_KEY_PREFIX + coelementName)

  if (coelement) {
    return coelement
  }

  if (elem[0]) {
    throw new Error('no coelement named: ' + coelementName + ', on the dom: ' + elem[0].tagName)
  }

  throw new Error('coelement "' + coelementName + '" unavailable at empty dom selection')
}
