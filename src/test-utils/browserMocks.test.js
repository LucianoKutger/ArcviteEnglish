import { vi } from 'vitest';

import {
  createAnimationFrameController,
  createCanvasMock,
  createDevicePixelRatioController,
  createElementSizeController,
  createResizeObserverController,
  createScrollController,
  createWindowSizeController,
} from './browserMocks';

describe('browserMocks', () => {
  test('controls requestAnimationFrame execution and cancellation', () => {
    const controller = createAnimationFrameController();
    const callback = vi.fn();

    const frameId = requestAnimationFrame(callback);

    expect(controller.pendingFrameCount).toBe(1);
    expect(controller.pendingFrameIds).toContain(frameId);

    expect(controller.runNextFrame(32)).toBe(true);
    expect(callback).toHaveBeenCalledWith(32);
    expect(controller.pendingFrameCount).toBe(0);

    const cancelledFrameId = requestAnimationFrame(callback);

    cancelAnimationFrame(cancelledFrameId);

    expect(controller.pendingFrameCount).toBe(0);
  });

  test('triggers ResizeObserver entries for observed elements', () => {
    const controller = createResizeObserverController();
    const callback = vi.fn();
    const element = document.createElement('div');

    const observer = new ResizeObserver(callback);

    observer.observe(element);

    controller.trigger(element, {
      width: 320,
      height: 180,
    });

    expect(callback).toHaveBeenCalledTimes(1);

    const [entries, callbackObserver] = callback.mock.calls[0];

    expect(entries[0].target).toBe(element);
    expect(entries[0].contentRect.width).toBe(320);
    expect(entries[0].contentRect.height).toBe(180);
    expect(callbackObserver).toBe(observer);
  });

  test('provides one configurable 2D context per canvas', () => {
    const controller = createCanvasMock();
    const canvas = document.createElement('canvas');

    const firstContext = canvas.getContext('2d');
    const secondContext = canvas.getContext('2d');

    expect(firstContext).toBe(secondContext);
    expect(firstContext.canvas).toBe(canvas);
    expect(controller.contexts).toHaveLength(1);

    const gradient = firstContext.createLinearGradient(0, 0, 100, 0);

    gradient.addColorStop(0, 'transparent');

    expect(gradient.addColorStop).toHaveBeenCalledWith(0, 'transparent');

    expect(canvas.getContext('webgl')).toBeNull();
  });

  test('controls element dimensions and device pixel ratio', () => {
    const element = document.createElement('div');

    const sizeController = createElementSizeController(element, {
      width: 640,
      height: 360,
      top: 10,
      left: 20,
    });

    const pixelRatioController = createDevicePixelRatioController(2);

    expect(element.offsetWidth).toBe(640);
    expect(element.offsetHeight).toBe(360);
    expect(element.getBoundingClientRect()).toMatchObject({
      width: 640,
      height: 360,
      top: 10,
      left: 20,
      right: 660,
      bottom: 370,
    });

    expect(window.devicePixelRatio).toBe(2);

    sizeController.setSize({
      width: 800,
      height: 450,
    });

    pixelRatioController.setValue(3);

    expect(element.offsetWidth).toBe(800);
    expect(element.offsetHeight).toBe(450);
    expect(window.devicePixelRatio).toBe(3);
  });

  test('controls window size and dispatches resize events', () => {
    const resizeListener = vi.fn();

    window.addEventListener('resize', resizeListener);

    const controller = createWindowSizeController({
      width: 1024,
      height: 768,
    });

    expect(window.innerWidth).toBe(1024);
    expect(window.innerHeight).toBe(768);

    controller.setSize({
      width: 390,
      height: 844,
    });

    expect(window.innerWidth).toBe(390);
    expect(window.innerHeight).toBe(844);
    expect(resizeListener).toHaveBeenCalledTimes(1);

    window.removeEventListener('resize', resizeListener);
  });

  test('controls scrolling and scrollIntoView', () => {
    const scrollListener = vi.fn();

    window.addEventListener('scroll', scrollListener);

    const controller = createScrollController();

    controller.setPosition({
      y: 120,
    });

    expect(window.scrollY).toBe(120);
    expect(window.pageYOffset).toBe(120);
    expect(scrollListener).toHaveBeenCalledTimes(1);

    window.scrollTo({
      top: 300,
      left: 20,
      behavior: 'smooth',
    });

    expect(controller.x).toBe(20);
    expect(controller.y).toBe(300);

    const element = document.createElement('div');

    element.scrollIntoView({
      behavior: 'smooth',
    });

    expect(controller.scrollIntoViewMock).toHaveBeenCalledWith({
      behavior: 'smooth',
    });

    window.removeEventListener('scroll', scrollListener);
  });
});
