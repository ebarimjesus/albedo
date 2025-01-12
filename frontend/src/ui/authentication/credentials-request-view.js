import React, {useRef} from 'react'
import PropTypes from 'prop-types'
import {Button, useDependantState} from '@stellar-expert/ui-framework'
import {ACCOUNT_TYPES} from '../../state/account'

const defaultState = {
    password: '',
    confirmation: '',
    validationError: null
}

export default function CredentialsRequestView({
                                                   confirmText = 'Confirm',
                                                   onConfirm,
                                                   onCancel,
                                                   requestPasswordConfirmation,
                                                   inProgress,
                                                   noRegistrationLink,
                                                   error
                                               }) {
    const firstInputRef = useRef(null)

    const [{password, confirmation, validationError}, updateState] = useDependantState(() => {
        focusFirstInput()
        return {...defaultState}
    }, [confirmText, onConfirm, onCancel, requestPasswordConfirmation, noRegistrationLink, error])

    function focusFirstInput() {
        setTimeout(() => {
            const input = firstInputRef.current
            input && input.focus()
        }, 200)
    }

    function confirm() {
        const validationError = validate()
        if (validationError) {
            updateState({...defaultState, validationError})
            focusFirstInput()
        } else {
            updateState({...defaultState})
            onConfirm({password, type: ACCOUNT_TYPES.STORED_ACCOUNT})
        }
    }

    function onKeyDown(e) {
        //handle Esc key
        if (e.keyCode === 27) {
            onCancel && cancel()
        }
        //handle Enter key
        if (e.keyCode === 13) {
            confirm()
        }
    }

    function validate() {
        if (password && password.length < 8) return 'Password too short'
        if (requestPasswordConfirmation && password !== confirmation) return 'Passwords do not match'
        return null
    }

    function setValue(name, value) {
        //value = value.trim()
        updateState(current => ({
            ...current,
            [name]: value,
            validationError: null
        }))
    }

    const errorsToShow = validationError || error

    return <>
        <div className="segment">
            <div>
                <input type="password" name="password" placeholder="Password"
                       ref={firstInputRef} value={password || ''} onChange={e => setValue('password', e.target.value)}
                       onKeyDown={e => onKeyDown(e)}/>
            </div>
            {requestPasswordConfirmation && <div>
                <input type="password" name="confirmation" placeholder="Password confirmation"
                       value={confirmation || ''} onChange={e => setValue('confirmation', e.target.value)}
                       onKeyDown={e => onKeyDown(e)}/>
            </div>}
        </div>
        <div className="row actions space">
            {onConfirm && <div className="column column-50">
                <Button block disabled={!!inProgress} onClick={confirm}>{confirmText}</Button>
            </div>}
            {onCancel && <div className="column column-50">
                <Button block outline onClick={onCancel}>Cancel</Button>
            </div>}
        </div>
        {errorsToShow && <div className="error space text-center text-small">
            <i className="icon-warning-hexagon"/> Error: {errorsToShow}
        </div>}
        {!noRegistrationLink && <>
            <hr title="not registered yet?" className="flare"/>
            <div className="row">
                <div className="column column-50 column-offset-25">
                    <Button block href="/signup">Create new account</Button>
                </div>
            </div>
        </>}
    </>
}

CredentialsRequestView.propTypes = {
    //text to display as a Confirm button caption
    confirmText: PropTypes.string,
    //user presses Enter key
    onConfirm: PropTypes.func.isRequired,
    //user presses Esc key
    onCancel: PropTypes.func.isRequired,
    //request password confirmation
    requestPasswordConfirmation: PropTypes.bool,
    //action is in progress
    inProgress: PropTypes.bool,
    //whether to show "create account" link or not
    noRegistrationLink: PropTypes.bool,
    //error message provided from a top level component
    error: PropTypes.string
}
