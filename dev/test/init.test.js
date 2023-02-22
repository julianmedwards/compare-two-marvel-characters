'use strict'

import sinon from 'sinon'

const mockPage = '<!DOCTYPE html><head></head><body></body>'

// Fake dom with Jquery attached.
import {JSDOM} from 'jsdom'
const {window} = new JSDOM(mockPage)
global.window = window
import fakeJQ from 'jquery'
const $ = fakeJQ(window)

import {init} from '../js/init.js'
import {jq} from '../js/init.js'

describe('init.js', function () {
    this.beforeAll(function () {})
    this.beforeEach(function () {
        sinon.restore()
        // Swap script's Jquery with ours attached to the fake dom.
        sinon.replace(jq, '$', $)
        sinon.stub(console, 'log')
    })
    describe('Retrieve API key', function () {
        describe('init.initialize()', function () {
            let retrieveAPI,
                retrieveData,
                retrieveActor,
                retrieveRevenue,
                tmdbRequest,
                populatePage,
                initEls
            this.beforeEach(function () {
                initEls = sinon.stub(init, 'initEventListeners')
            })
            it('should make all its calls on success', function () {
                retrieveAPI = sinon
                    .stub(init, 'retrieveAPIKeys')
                    .callsFake(() => {
                        const d = $.Deferred()
                        d.resolve({key: 'fakeKey', RAToken: 'fakeToken'})
                        return d.promise()
                    })
                retrieveData = sinon
                    .stub(init, 'retrieveData')
                    .callsFake(() => {
                        const d = $.Deferred()
                        d.resolve({data: 'val'})
                        return d.promise()
                    })
                populatePage = sinon
                    .stub(init, 'populatePageData')
                    .callsFake(() => {
                        const d = $.Deferred()
                        d.resolve()
                        return d.promise()
                    })

                init.initialize()

                sinon.assert.calledOnce(retrieveAPI)
                sinon.assert.calledOnce(retrieveData)
                sinon.assert.calledOnce(populatePage)
                sinon.assert.calledOnce(initEls)
            })
            it('should fail on retrieveAPIKeys rejection', function () {
                retrieveAPI = sinon
                    .stub(init, 'retrieveAPIKeys')
                    .callsFake(() => {
                        const d = $.Deferred()
                        d.reject()
                        return d.promise()
                    })
                retrieveActor = sinon.stub(init, 'retrieveActorData')
                populatePage = sinon.spy(init, 'populatePageData')

                const failLoad = sinon.stub(init, 'failLoad')

                init.initialize()

                sinon.assert.calledOnce(retrieveAPI)
                sinon.assert.calledOnce(failLoad)
                sinon.assert.notCalled(retrieveActor)
                sinon.assert.notCalled(populatePage)
                sinon.assert.notCalled(initEls)
            })
            it('should fail on retrieveData rejection', function () {
                retrieveAPI = sinon
                    .stub(init, 'retrieveAPIKeys')
                    .callsFake(() => {
                        const d = $.Deferred()
                        d.resolve({key: 'fakeKey', RAToken: 'fakeToken'})
                        return d.promise()
                    })
                retrieveData = sinon
                    .stub(init, 'retrieveData')
                    .callsFake(() => {
                        const d = $.Deferred()
                        d.reject()
                        return d.promise()
                    })
                populatePage = sinon.spy(init, 'populatePageData')

                const failLoad = sinon.stub(init, 'failLoad')

                init.initialize()

                sinon.assert.calledOnce(retrieveAPI)
                sinon.assert.calledOnce(retrieveData)
                sinon.assert.calledOnce(failLoad)
                sinon.assert.notCalled(populatePage)
                sinon.assert.notCalled(initEls)
            })
            it('should fail on populatePageData rejection', function () {
                retrieveAPI = sinon
                    .stub(init, 'retrieveAPIKeys')
                    .callsFake(() => {
                        const d = $.Deferred()
                        d.resolve({key: 'fakeKey', RAToken: 'fakeToken'})
                        return d.promise()
                    })
                retrieveData = sinon
                    .stub(init, 'retrieveData')
                    .callsFake(() => {
                        const d = $.Deferred()
                        d.resolve({data: 'val'})
                        return d.promise()
                    })
                populatePage = sinon
                    .stub(init, 'populatePageData')
                    .callsFake(() => {
                        const d = $.Deferred()
                        d.reject()
                        return d.promise()
                    })

                const failLoad = sinon.stub(init, 'failLoad')

                init.initialize()

                sinon.assert.calledOnce(retrieveAPI)
                sinon.assert.calledOnce(retrieveData)
                sinon.assert.calledOnce(populatePage)
                sinon.assert.calledOnce(failLoad)
                sinon.assert.notCalled(initEls)
            })
        })
    })
})
