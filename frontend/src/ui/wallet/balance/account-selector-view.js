import React, {useState} from 'react'
import {Dropdown, AccountIdenticon, formatExplorerLink} from '@stellar-expert/ui-framework'
import {navigation} from '@stellar-expert/navigation'
import accountManager from '../../../state/account-manager'

export default function AccountSelectorView({actionMode = false}) {
    const [current, setCurrentAccount] = useState(() => accountManager.activeAccount)

    function handleAction(action) {
        switch (action) {
            case 'settings':
                navigation.navigate('/account-settings')
                break
            case 'explorer':
                window.open(formatExplorerLink('account', current.publicKey))
                break
            case 'login':
                navigation.navigate('/login')
                break
            case 'signup':
                navigation.navigate('/signup')
                break
            case 'walletconnect':
                navigation.navigate('/wallet-connect/connect')
                break
            default:
                const account = accountManager.get(action)
                if (account) {
                    accountManager.setActiveAccount(account)
                    setCurrentAccount(account)
                }
                break
        }
    }

    const {accounts: allAccounts} = accountManager
    if (!current) {
        navigation.navigate('/login')
        return null
    }
    const dropdownOptions = [{
        value: 'title',
        title: <><AccountIdenticon address={current.publicKey}/> {current.shortDisplayName}</>
    }]
    for (let account of allAccounts)
        if (account !== current) {
            dropdownOptions.push({
                value: account.id,
                title: <>Switch to&nbsp;<AccountIdenticon address={account.publicKey}/> {account.displayName}</>
            })
        }

    dropdownOptions.push({
        value: 'signup',
        title: <>Create/import new account</>
    })

    if (!actionMode) {
        if (dropdownOptions.length > 1) {
            dropdownOptions.push('-')
        }

        dropdownOptions.push({
            value: 'settings',
            title: <>Manage settings for this account</>
        })

        dropdownOptions.push({
            value: 'explorer',
            title: <>View details on StellarExpert</>
        })

        dropdownOptions.push({
            value: 'walletconnect',
            title: <>Link via WalletConnect</>
        })
    }

    return <Dropdown value="title" onChange={handleAction} options={dropdownOptions} hideSelected
                     header={<h3 style={{margin: 0}}>Switch account</h3>}/>
}