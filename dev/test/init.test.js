'use strict'

import {expect} from 'chai'
import sinon from 'sinon'

const mockPage = '<!DOCTYPE html><head></head><body></body>'

// Fake dom with Jquery attached.
import {JSDOM} from 'jsdom'
const {window} = new JSDOM(mockPage)
global.window = window
import jq from 'jquery'
const $ = jq(window)

import {init} from '../js/init.js'
import {testRefs} from '../js/init.js'

describe('init.js', function () {
    this.beforeAll(function () {
        // Swap script's Jquery with ours attached to the fake dom.
        sinon.replace(testRefs, '$', $)
    })
    this.beforeEach(function () {
        sinon.restore()
    })
    describe('Retrieve API key', function () {
        describe('init.initialize()', function () {
            let retrieveAPI, populatePage, initEls
            this.beforeEach(function () {
                initEls = sinon.stub(init, 'initEventListeners')
            })
            it('should make its three calls on success', function () {
                retrieveAPI = sinon
                    .stub(init, 'retrieveAPIKeys')
                    .callsFake(() => {
                        const d = $.Deferred()
                        d.resolve()
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
                populatePage = sinon.stub(init, 'populatePageData')

                const failLoad = sinon.stub(init, 'failLoad')

                init.initialize()

                sinon.assert.calledOnce(retrieveAPI)
                sinon.assert.calledOnce(failLoad)
                sinon.assert.notCalled(populatePage)
                sinon.assert.notCalled(initEls)
            })
            it('should fail on populatePageData rejection', function () {
                retrieveAPI = sinon
                    .stub(init, 'retrieveAPIKeys')
                    .callsFake(() => {
                        const d = $.Deferred()
                        d.resolve()
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
                sinon.assert.calledOnce(populatePage)
                sinon.assert.calledOnce(failLoad)
                sinon.assert.notCalled(initEls)
            })
        })
    })
})
