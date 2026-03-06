/**
 * Tests for plugin component registry.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import type { ComponentType } from 'react'
import {
  registerPluginComponent,
  getPluginComponents,
  clearPluginRegistry,
  type SlotName,
} from './registry'

// Stub components for testing
const StubComponentA = (() => null) as ComponentType<Record<string, unknown>>
const StubComponentB = (() => null) as ComponentType<Record<string, unknown>>

beforeEach(() => {
  clearPluginRegistry()
})

describe('registerPluginComponent', () => {
  it('adds a component to a slot', () => {
    registerPluginComponent('post-content', 'test-plugin', StubComponentA)

    const components = getPluginComponents('post-content')
    expect(components).toHaveLength(1)
    expect(components[0]!.pluginName).toBe('test-plugin')
    expect(components[0]!.component).toBe(StubComponentA)
  })

  it('allows multiple plugins in the same slot', () => {
    registerPluginComponent('post-content', 'plugin-a', StubComponentA)
    registerPluginComponent('post-content', 'plugin-b', StubComponentB)

    const components = getPluginComponents('post-content')
    expect(components).toHaveLength(2)
    expect(components[0]!.pluginName).toBe('plugin-a')
    expect(components[1]!.pluginName).toBe('plugin-b')
  })

  it('prevents duplicate registration for same plugin and slot', () => {
    registerPluginComponent('post-content', 'test-plugin', StubComponentA)
    registerPluginComponent('post-content', 'test-plugin', StubComponentB)

    const components = getPluginComponents('post-content')
    expect(components).toHaveLength(1)
    expect(components[0]!.component).toBe(StubComponentA)
  })

  it('allows same plugin in different slots', () => {
    registerPluginComponent('post-content', 'test-plugin', StubComponentA)
    registerPluginComponent('topic-sidebar', 'test-plugin', StubComponentA)

    expect(getPluginComponents('post-content')).toHaveLength(1)
    expect(getPluginComponents('topic-sidebar')).toHaveLength(1)
  })
})

describe('getPluginComponents', () => {
  it('returns registered components for a slot', () => {
    registerPluginComponent('admin-dashboard', 'dashboard-plugin', StubComponentA)

    const result = getPluginComponents('admin-dashboard')
    expect(result).toHaveLength(1)
    expect(result[0]!.pluginName).toBe('dashboard-plugin')
  })

  it('returns empty array for unregistered slot', () => {
    const result = getPluginComponents('user-profile')
    expect(result).toEqual([])
  })

  it('returns empty array for slot with no registrations', () => {
    // Register in a different slot, then query an unused one
    registerPluginComponent('post-content', 'some-plugin', StubComponentA)
    const result = getPluginComponents('settings-community')
    expect(result).toEqual([])
  })
})

describe('clearPluginRegistry', () => {
  it('removes all registrations', () => {
    registerPluginComponent('post-content', 'plugin-a', StubComponentA)
    registerPluginComponent('topic-sidebar', 'plugin-b', StubComponentB)

    clearPluginRegistry()

    expect(getPluginComponents('post-content')).toEqual([])
    expect(getPluginComponents('topic-sidebar')).toEqual([])
  })

  it('allows re-registration after clearing', () => {
    registerPluginComponent('post-content', 'test-plugin', StubComponentA)
    clearPluginRegistry()
    registerPluginComponent('post-content', 'test-plugin', StubComponentB)

    const components = getPluginComponents('post-content')
    expect(components).toHaveLength(1)
    expect(components[0]!.component).toBe(StubComponentB)
  })
})
