import React, {useEffect, useState} from 'react'
import {Memo} from 'stellar-sdk'
import {runInAction} from 'mobx'
import {observer} from 'mobx-react'
import {Dropdown, useAutoFocusRef} from '@stellar-expert/ui-framework'

const memoTypes = ['none', 'text', 'id', 'hash', 'return']

function getPlaceholder(memoType) {
    switch (memoType) {
        case 'text':
            return 'Memo text'
        case 'id':
            return 'Memo id'
        case 'return':
        case 'hash':
            return 'Memo hash (HEX encoding)'
    }
}

function TxMemoView({transfer, allowMuxed = true}) {
    const [value, setValue] = useState('')
    const [type, setType] = useState(transfer.memo?.type || 'none')

    useEffect(() => {
        if (transfer.memo?.type !== type) {
            setType('none')
            setValue('')
            runInAction(() => {
                transfer.memo = undefined
                transfer.invalidMemo = false
                transfer.encodeMuxedAddress = false
            })
        }
    }, [transfer.memo])

    function setMemoType(type) {
        setType(type)
        setMemo(type, value)
        if (allowMuxed && transfer.encodeMuxedAddress && type !== 'id') {
            transfer.toggleMuxed()
        }
    }

    function setMemoValue(e) {
        const {value} = e.target
        setValue(value)
        setMemo(type, value)
    }

    function setMemo(type, value) {
        runInAction(() => {
            if (!value || type === 'none') {
                transfer.memo = undefined
                transfer.invalidMemo = false
            } else {
                try {
                    transfer.memo = new Memo(type, value.trim())
                    transfer.invalidMemo = false
                } catch (e) {
                    transfer.invalidMemo = true
                }
            }
        })
    }

    return <div className="text-small dimmed space">
        Transaction memo: <Dropdown options={memoTypes} value={type} onChange={setMemoType}/> (optional)
        {type !== 'none' && <div>
            <input type="text" value={value} onChange={setMemoValue} placeholder={getPlaceholder(type)} ref={useAutoFocusRef}/>
        </div>}
        {!!allowMuxed && type === 'id' && <label className="micro-space text-tiny">
            <input type="checkbox" checked={transfer.encodeMuxedAddress} onChange={() => transfer.toggleMuxed()}/>{' '}
            Encode as multiplexed address <span className="dimmed">(starting with M...)</span>
        </label>}
    </div>
}

export default observer(TxMemoView)