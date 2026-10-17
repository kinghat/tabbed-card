import test from 'node:test';
import assert from 'node:assert/strict';
import {fixture} from './fixture.mjs';
import {readAt, replaceAt, editList, defaultIndex} from '../.test-build/editor-model.js';

test('deep edits are immutable and preserve unrelated extension fields and lighting masks', () => {
  const original = structuredClone(fixture);
  const path = ['tabs', 0, 'card', 'cards', 1, 'cards', 0, 'cards', 0, 'name'];
  const changed = replaceAt(original, path, 'Changed');
  assert.equal(readAt(changed, path), 'Changed');
  assert.deepEqual(replaceAt(changed, path, 'Lamp'), fixture);
  assert.deepEqual(original, fixture);
  const withoutOptions = {...fixture}; delete withoutOptions.options;
  assert.deepEqual(replaceAt(withoutOptions, ['options', 'defaultTabIndex'], 1).options, {defaultTabIndex: 1});
});

test('moving and copying tabs follows the explicitly selected default without losing metadata', () => {
  for (const operation of ['up', 'down']) {
    const index = operation === 'up' ? 1 : 0;
    const moved = editList(fixture, ['tabs'], index, operation);
    assert.equal(moved.tabs[moved.options.defaultTabIndex].attributes.label, 'Other');
    assert.deepEqual(moved.options.futureOption, fixture.options.futureOption);
  }
  const copied = editList(fixture, ['tabs'], 0, 'copy');
  assert.equal(copied.options.defaultTabIndex, 2);
  copied.tabs[1].attributes.extra = 6;
  assert.equal(copied.tabs[0].attributes.extra, 5);
});

test('deleting default, preceding and final tabs leaves a valid default', () => {
  for (const index of [0, 1]) {
    const removed = editList(fixture, ['tabs'], index, 'delete');
    assert.equal(defaultIndex(removed), 0);
    assert.equal(removed.options.defaultTabIndex, 0);
    const empty = editList(removed, ['tabs'], 0, 'delete');
    assert.deepEqual(empty.tabs, []); assert.equal(defaultIndex(empty), 0);
  }
  assert.equal(defaultIndex({...fixture, options: {defaultTabIndex: 200}}), 1);
  assert.equal(defaultIndex({...fixture, options: {defaultTabIndex: -4}}), 0);
});

test('implicit defaults and nested collections do not create unrelated options', () => {
  const config = structuredClone(fixture); delete config.options;
  const moved = editList(config, ['tabs'], 0, 'down'); assert.equal(moved.options, undefined);
  const path = ['tabs', 0, 'card', 'cards'];
  assert.deepEqual(editList(fixture, path, 0, 'copy').options, fixture.options);
  assert.equal(editList(fixture, path, 0, 'up'), fixture);
});
