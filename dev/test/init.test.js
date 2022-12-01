'use strict'

import {expect} from 'chai'
import sinon from 'sinon'

const mockPage = '<!DOCTYPE html><head></head><body></body>'

import {JSDOM} from 'jsdom'
const {window} = new JSDOM(mockPage)
import pkg from 'jquery'
const $ = pkg(window)
// console.log(`jQuery ${$.fn.jquery} working! Yay!!!`)
// $('body').html('<p>Please work</p>')
// console.log($('p').text())

import {init} from '../js/init.js'
import {jqRef} from '../js/init.js'

describe('Retrieve API key', function () {
    this.beforeAll(function () {
        sinon.restore()
        sinon.replace(jqRef, '$', $)
    })
    describe('init.initialize() integration', function () {
        it('do things', function () {
            const retrieveAPI = sinon
                .stub(init, 'retrieveAPIKeys')
                .callsFake(() => {
                    const d1 = $.Deferred()
                    d1.resolve()
                    return d1.promise()
                })
            const populatePage = sinon
                .stub(init, 'populatePageData')
                .callsFake(() => {
                    const d2 = $.Deferred()
                    d2.resolve()
                    return d2.promise()
                })
            const initELs = sinon.spy(init, 'initEventListeners')

            init.initialize()

            sinon.assert.calledOnce(retrieveAPI)
            sinon.assert.calledOnce(populatePage)
            sinon.assert.calledOnce(initELs)
        })
    })
})

// describe('Test-test', function () {
//     it('should succeed', function () {
//         let spy = sinon.spy(init, 'initialize')
//         init.initialize()
//         sinon.assert.calledOnce(spy)
//     })
// })
