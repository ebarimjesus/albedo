import {Keypair} from 'stellar-sdk'
import shajs from 'sha.js'
import isEqual from 'react-fast-compare'
import HwSigner from '../hw-signer/hw-signer'
import {ACCOUNT_TYPES} from '../state/account'
import appSettings from '../state/app-settings'
import actionContext from '../state/action-context'

export default class ActionAuthenticationContext {
    /**
     * Create new instance of AccountActionsWrapper for a given account.
     * @param {Account} account - Account to use.
     * @return {ActionAuthenticationContext}
     */
    static forAccount(account) {
        const res = new ActionAuthenticationContext()
        res.account = account
        res.publicKey = account.publicKey
        if (account.secret) {
            res.secret = account.secret
        }
        if (account.isHWAccount) {
            res.hwSigner = new HwSigner(account.accountType)
        }
        return res
    }

    /**
     * Account to use for signing.
     * @type {Account}
     */
    account = null

    /**
     * Public key of the keypair that should be used for signing.
     * @type {String}
     */
    publicKey = ''

    /**
     * Secret key (only if case of direct key input or restored implicit session)
     * @type {String}
     */
    secret = ''

    /**
     * Credentials selected for current action.
     * @type {Credentials}
     */
    credentials = null

    hwSigner = null

    /**
     *
     * @param {String} message
     * @return {Promise<{signature: Buffer, signedMessage: Buffer}>}
     */
    async signMessage(message) {
        const messageToSign = `${this.publicKey}:${message}`,
            rawMessage = shajs('sha256').update(messageToSign).digest()
        let signature
        if (this.secret) { //direct secret key input or implicit session
            signature = Keypair.fromSecret(this.secret).sign(rawMessage)
        } else if (this.account.isStoredAccount) { //stored account
            signature = (await this.getStoredKeypair()).sign(rawMessage)
        } else if (this.account.isHWAccount) { //hardware wallet
            const keyPath = await this.getHWSignerPath()
            signature = await this.hwSigner.signMessage({
                path: keyPath,
                publicKey: this.publicKey,
                message: rawMessage
            })
        } else
            throw new Error('Unsupported account type:' + this.account.accountType)
        return {
            signature,
            signedMessage: messageToSign
        }
    }

    async signTransaction(transaction) {
        //save existing transaction signatures
        const existingSignatures = [...transaction.signatures]
        if (this.secret) { //direct secret key input or implicit session
            transaction.sign(Keypair.fromSecret(this.secret))
        } else if (this.account.isStoredAccount) { //stored account
            transaction.sign(await this.getStoredKeypair())
        } else if (this.account.isHWAccount) { //hardware wallet
            const keyPath = await this.getHWSignerPath()
            try {
                await this.hwSigner.signTransaction({
                    path: keyPath,
                    publicKey: this.publicKey,
                    transaction
                })
            } catch (e) {
                switch (e.name) {
                    case 'TransportStatusError':
                    default:
                        actionContext.runtimeErrors = 'Failed to connect. Please check hardware wallet connection.'
                        break
                }
                return
            }
        }
        let newSignature = null
        //find new signature and return it
        for (let sig of transaction.signatures.slice()) {
            //remove duplicates
            while (transaction.signatures.filter(s => isEqual(s.signature(), sig.signature())).length > 1) {
                const idx = transaction.signatures.findIndex(s => isEqual(s.signature(), sig.signature()))
                transaction.signatures.splice(idx, 1)
            }
            //check whether it's a new signature
            if (!existingSignatures.includes(sig)) {
                newSignature = sig
            }
        }
        return newSignature
    }

    async getStoredKeypair() {
        //use stored account for signing
        const secret = this.account.requestAccountSecret(this.credentials)
        if (!secret) throw new Error(`Failed to retrieve a secret key for stored account.`)
        return Keypair.fromSecret(secret)
    }

    async getHWSignerPath() {
        if (!this.account.isHWAccount) throw new Error(`Failed to retrieve BIP-44 path from the non-hardware account.`)
        const {path} = this.account
        if (!path) throw new Error(`Failed to retrieve BIP-44 key path from the hardware wallet account.`)
        await this.hwSigner.init({
            appManifest: appSettings.appManifest
        })
        return path
    }

    async retrieveSessionData() {
        const res = {
            accountType: this.account.accountType,
            publicKey: this.publicKey
        }

        if (res.accountType === ACCOUNT_TYPES.STORED_ACCOUNT) {
            res.secret = this.account.requestAccountSecret(this.credentials)
        } else if (this.secret) {
            res.secret = this.secret
        }
        return res
    }
}
