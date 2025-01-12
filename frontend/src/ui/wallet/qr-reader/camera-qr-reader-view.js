import React, {useEffect, useRef, useState} from 'react'
import {BrowserQRCodeReader} from '@zxing/browser'
import WalletPageActionDescription from '../shared/wallet-page-action-description'

export function CameraQrReaderView({requestText, onChange}) {
    const [accessStatus, setAccessStatus] = useState('')
    const [error, setError] = useState()
    const previewRef = useRef()

    useEffect(() => {
        if (accessStatus !== 'granted') {
            //try access camera stream
            checkCameraStream()
                .then(() => setAccessStatus('granted'))
                .catch(e => setError(e))
            //periodically check for correct permissions
            const permissionPollInterval = setInterval(() => {
                checkCameraPermission()
                    .then(res => {
                        setAccessStatus(res)
                        //stop polling if permission has been granted
                        if (res === 'granted') {
                            clearInterval(permissionPollInterval)
                        }
                    })
            }, 1000)
            //stop polling on exit
            return () => clearInterval(permissionPollInterval)
        }
        //init reader
        const codeReader = new BrowserQRCodeReader(null, {delayBetweenScanAttempts: 300})
        //attach reader to the preview control and set video constraints
        let decoderControls
        codeReader.decodeFromConstraints(videoConstraints, previewRef.current, (res, e) => {
            if (e) {
                if (e.name === 'NotFoundException') return
                console.error(e)
            } else {
                onChange({parsed: res.text})
            }
        })
            .then(controls => decoderControls = controls)
            .catch(e => console.error(e))
        //stop decoding
        return () => decoderControls?.stop()
    }, [accessStatus])

    //show loader if access has not been granted yet
    if (!accessStatus)
        return <div className="loader"/>
    //video stream access error
    if (error === 'unavailable')
        return <CameraErrorView>
            <div>
                No suitable video camera device detected
            </div>
            <div>
                Please turn on your camera and refresh this page
            </div>
        </CameraErrorView>

    if (accessStatus === 'denied' || error === 'NotAllowed')
        return <CameraErrorView>
            <div>
                Camera access on this device is blocked
            </div>
            <div className="text-small micro-space">
                Learn how to unblock it <a href="https://help.daily.co/en/articles/2528184-unblock-camera-mic-access-on-a-computer"
                                           target="_blank" rel="nofollow noreferrer">here</a>
            </div>
        </CameraErrorView>

    //request access status
    if (accessStatus === 'prompt')
        return <CameraErrorView blocked={false}>
            We need access to the camera on this device to scan a QR code.
            Please confirm the browser request.
        </CameraErrorView>

    //everything is ok
    if (accessStatus === 'granted')
        return <div>
            <WalletPageActionDescription>{requestText}</WalletPageActionDescription>
            <div className="qr-overlay space">
                <video muted className="qr-camera-preview" ref={previewRef} style={{width: '100%', minHeight: '60%'}}/>
                <div className="overlay camera-frame"/>
            </div>
        </div>
    return null
}

function CameraErrorView({children, blocked = true}) {
    return <div className="v-center-block text-center" style={{minHeight: '1vmin'}}>
        <div>
            <div style={{fontSize: '2em'}}>
                <span className="icon icon-qr color-warning"/>
                {blocked && <span className="color-danger"
                                  style={{
                                      display: 'inline-block',
                                      position: 'absolute',
                                      margin: '-0.3em -0.6em',
                                      fontSize: '1.5em'
                                  }}>/</span>}
            </div>
            <div className="dimmed">
                {children}
            </div>
        </div>
    </div>
}

const videoConstraints = {
    audio: false,
    video: {
        facingMode: {
            ideal: 'environment'
        }
    }
}

/**
 * Check if a user enabled camera access
 * @return {Promise<"denied"|"granted"|"prompt">}
 */
function checkCameraPermission() {
    return navigator.permissions.query({name: 'camera'}).then(res => res.state)
}

/**
 * Try to start camera stream to check whether everything is working
 * @return {Promise}
 */
function checkCameraStream() {
    return new Promise((resolve, reject) => {
        navigator.mediaDevices.getUserMedia(videoConstraints)
            .then((stream) => {
                stream.getTracks().forEach(track => track.stop())
                resolve()
            })
            .catch((err) => {
                switch (err.name) {
                    case 'NotAllowedError':
                        reject('blocked')
                        break
                    case 'NotFoundError':
                        reject('unavailable')
                        break
                    default:
                        reject('unknown-error')
                }
            })
    })
}