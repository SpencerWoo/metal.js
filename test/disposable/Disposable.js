'use strict';

import core from '../../src/core';
import Disposable from '../../src/disposable/Disposable';

describe('Disposable', function() {
  it('should correctly inform if the instance has been disposed', function() {
    var disposable = new Disposable();

    assert.ok(!disposable.isDisposed());

    disposable.dispose();
    assert.ok(disposable.isDisposed());
  });

  it('should call `disposeInternal` when running `dispose`', function() {
    var TestDisposable = function() {};
    core.inherits(TestDisposable, Disposable);

    TestDisposable.prototype.disposeInternal = sinon.stub();

    var testDisposable = new TestDisposable();
    testDisposable.dispose();

    assert.strictEqual(1, testDisposable.disposeInternal.callCount);
  });

  it('should not dispose more than once', function() {
    var TestDisposable = function() {};
    core.inherits(TestDisposable, Disposable);

    TestDisposable.prototype.disposeInternal = sinon.stub();

    var testDisposable = new TestDisposable();
    testDisposable.dispose();
    testDisposable.dispose();

    assert.strictEqual(1, testDisposable.disposeInternal.callCount);

  });
});
