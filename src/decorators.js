// @flow

import { registerListenerInfo } from './register-listener-info.js'
import camelToKebab from './camel-to-kebab.js'
import { register as cc } from './register-and-init.js'
import trigger from './event-trigger.js'

/**
 * The decorator for registering event listener info to the method.
 * @param event The event name
 * @param at The selector
 */
cc.on = (event: string, { at }: { at: string } = {}) => (target: Object, key: string) => {
  registerListenerInfo(target.constructor, key, event, at)
}

/**
 * `@emit(event)` decorator.
 * This decorator adds the event emission at the beginning of the method.
 * @param event The event name
 */
cc.emit = (event: string) => (target: Object, key: string, descriptor: Object) => {
  const method = descriptor.value

  descriptor.value = function () {
    trigger(this.el, event, arguments[0])

    return method.apply(this, arguments)
  }
}

/**
 * `@emit.last(event)` decorator
 *
 * This decorator adds the event emission at the end of the method.
 * If the method returns the promise, then the event is emitted when it is resolved.
 * @param event The event name
 */
cc.emit.last = (event: string) => (target: Object, key: string, descriptor: Object) => {
  const method = descriptor.value

  descriptor.value = function () {
    const result = method.apply(this, arguments)

    const emit = x => trigger(this.el, event, x)

    if (result && result.then) {
      result.then(emit)
    } else {
      emit(result)
    }

    return result
  }
}

/**
 * Replaces the getter with the function which accesses the class-component of the given name.
 * @param {string} name The class component name
 * @param {string} [selector] The selector to access class component dom. Optional. Default is '.[name]'.
 * @param {object} target The prototype of the target class
 * @param {string} key The name of the property
 * @param {object} descriptor The property descriptor
 */
const wireByNameAndSelector = (name: string, selector?: string) => (target: Object, key: string, descriptor: Object) => {
  selector = selector || '.' + name

  descriptor.get = function () {
    return this.$el.filter(selector).add(selector, this.el).cc.get(name)
  }
}

/**
 * Wires the class component of the name of the key to the property of the same name.
 */
cc.wire = (target: Object, key: string, descriptor: Object) => {
  if (typeof target === 'string') {
    // If target is a tring, then we suppose this is called as @wire(componentName, selector) and therefore
    // we need to return the following expression (it works as another decorator).
    return wireByNameAndSelector(target, key)
  }

  wireByNameAndSelector(camelToKebab(key))(target, key, descriptor)
}

/**
 * The decorator for class component registration.
 *
 * if `name` is function, then use it as class itself and the component name is kebabized version of its name.
 * @param name The class name or the implementation class itself
 * @return The decorator if the class name is given, undefined if the implementation class is given
 */
cc.component = (name: string | Function): ?Function => {
  if (typeof name !== 'function') {
    return Cls => cc((name: any), Cls)
  }

  return cc(camelToKebab(name.name), name)
}
