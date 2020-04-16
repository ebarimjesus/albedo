import errors from '../util/errors'
import {isInsideExtensionBackgroundScript} from '../util/extension-utils'
import actionContext from '../state/action-context'

const urlSchema = 'url:'

/**
 * POST response to callback address accordingly to SEP-0007.
 * @param {String} callback - Callback endpoint.
 * @param {Object} data - Response data.
 * @return {Promise<void>}
 */
function execCallback(callback, data) {
    if (callback.indexOf(urlSchema) !== 0) return Promise.reject(new Error('Unsupported callback schema: ' + callback))
    const action = callback.substr(urlSchema.length)
    const form = document.createElement('form')
    document.body.appendChild(form)
    form.method = 'post'
    form.action = action
    for (let name in data) {
        if (data.hasOwnProperty(name)) {
            const input = document.createElement('input')
            input.type = 'hidden'
            input.name = name
            input.value = data[name]
            form.appendChild(input)
        }
    }
    form.submit()
    return Promise.resolve()
}

function postMessage(res, actionContext) {
    const target = locateCallerWindow(actionContext)
    if (!target) {
        alert('Unable to process. Caller application browser window has been closed.')
        return Promise.reject('Caller application browser window was not found.')
    }
    target.postMessage({albedoIntentResult: res}, '*')
    return Promise.resolve()
}

function locateCallerWindow(actionContext) {
    return actionContext.isInsideFrame ? window.top : window.opener
}

function dispatchIntentResponse(res, actionContext) {
    const {callback, __reqid} = actionContext.intentParams
    res.__reqid = __reqid
    //handle the implicit flow in the background script case
    if (isInsideExtensionBackgroundScript())
        return Promise.resolve(res)

    return callback ? execCallback(callback, res) : postMessage(res, actionContext)
}

/**
 * Reject the request.
 * @param {Error|String} [error] - Rejection reason or validation error.
 * @param {ActionContext} actionContext - Current action context.
 */
function handleIntentResponseError(error, actionContext) {
    if (!error) {
        error = errors.actionRejectedByUser
    }
    error = errors.prepareErrorDescription(error, actionContext.intentParams)
    //invocation from background script - extension messaging system will handle the response
    if (isInsideExtensionBackgroundScript())
        return Promise.reject(error)

    const {callback} = actionContext.intentParams
    if (callback) {
        alert(error.message || error)
    } else {
        return postMessage(error, actionContext)
            .catch(e => console.error(e))
    }
}

export {dispatchIntentResponse, handleIntentResponseError}