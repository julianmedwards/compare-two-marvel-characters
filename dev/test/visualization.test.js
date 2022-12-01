'use strict'

import {expect} from 'chai'
import sinon from 'sinon'

import {vis} from '../js/visualization.js'

describe('Test-test', function () {
    it('should succeed', function () {
        let spy = sinon.spy(vis, 'dummy')
        vis.dummy()
        sinon.assert.calledOnce(spy)
    })
})
