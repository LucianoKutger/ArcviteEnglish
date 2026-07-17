import { act, render } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

import {
  createAnimationFrameController,
  createCanvasMock,
  createDevicePixelRatioController,
  createDocumentVisibilityController,
  createElementSizeController,
  createIntersectionObserverController,
} from '../../test-utils/browserMocks';

import styles from './HeroFlowLines.module.scss';
import HeroFlowLines from './HeroFlowLines';

describe('HeroFlowLines', () => {
  let canvasController;
  let animationFrameController;
  let intersectionController;

  beforeEach(() => {
    canvasController = createCanvasMock();
    animationFrameController = createAnimationFrameController();
    intersectionController = createIntersectionObserverController();
  });

  test('renders the right-facing canvas and draws the default wave configuration', () => {
    createDevicePixelRatioController(2);

    const { container } = render(<HeroFlowLines />);

    const root = container.firstElementChild;
    const canvas = container.querySelector('canvas');

    expect(root).toHaveClass(styles.lpHeroBg);
    expect(canvas).toHaveClass(styles.canvas);

    expect(
      container.querySelector(`.${styles.lpGradientXright}`)
    ).toBeInTheDocument();

    expect(
      container.querySelector(`.${styles.lpGradientXleft}`)
    ).not.toBeInTheDocument();

    expect(
      container.querySelector(`.${styles.lpGradientY}`)
    ).toBeInTheDocument();

    expect(canvas).not.toHaveStyle({
      mixBlendMode: 'screen',
    });

    expect(intersectionController.latestObserver.targets.has(root)).toBe(true);

    const sizeController = createElementSizeController(root, {
      width: 800,
      height: 400,
    });

    sizeController.setSize({
      width: 800,
      height: 400,
    });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(canvas.width).toBe(1200);
    expect(canvas.height).toBe(600);
    expect(canvas.style.width).toBe('800px');
    expect(canvas.style.height).toBe('400px');

    const context = canvasController.latestContext;

    expect(context.scale).toHaveBeenCalledWith(1.5, 1.5);

    context.clearRect.mockClear();
    context.beginPath.mockClear();
    context.createLinearGradient.mockClear();
    context.moveTo.mockClear();
    context.lineTo.mockClear();
    context.stroke.mockClear();

    const executed = animationFrameController.runNextFrame();

    expect(executed).toBe(true);

    expect(context.clearRect).toHaveBeenCalledWith(0, 0, 800, 400);

    expect(context.createLinearGradient).toHaveBeenCalledTimes(3);

    expect(context.beginPath).toHaveBeenCalledTimes(3);
    expect(context.moveTo).toHaveBeenCalled();
    expect(context.lineTo).toHaveBeenCalled();
    expect(context.stroke).toHaveBeenCalledTimes(3);

    expect(animationFrameController.pendingFrameCount).toBe(1);
  });

  test('caps drawing at roughly 60 frames per second on high-refresh displays', () => {
    render(<HeroFlowLines />);

    const context = canvasController.latestContext;

    context.clearRect.mockClear();

    expect(animationFrameController.runNextFrame(8)).toBe(true);
    expect(context.clearRect).not.toHaveBeenCalled();
    expect(animationFrameController.pendingFrameCount).toBe(1);

    expect(animationFrameController.runNextFrame(17)).toBe(true);
    expect(context.clearRect).toHaveBeenCalledTimes(1);
    expect(animationFrameController.pendingFrameCount).toBe(1);
  });

  test('renders the left-facing gradient and supports a single fallback color', () => {
    const { container } = render(
      <HeroFlowLines direction="left" colors={['#112233']} />
    );

    expect(
      container.querySelector(`.${styles.lpGradientXleft}`)
    ).toBeInTheDocument();

    expect(
      container.querySelector(`.${styles.lpGradientXright}`)
    ).not.toBeInTheDocument();

    const root = container.firstElementChild;

    createElementSizeController(root, {
      width: 200,
      height: 100,
    });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    const context = canvasController.latestContext;

    context.gradients.length = 0;
    context.createLinearGradient.mockClear();

    animationFrameController.runNextFrame();

    expect(context.createLinearGradient).toHaveBeenCalledTimes(3);

    expect(context.gradients).toHaveLength(3);

    context.gradients.forEach((gradient) => {
      expect(gradient.addColorStop).toHaveBeenCalledWith(
        0,
        'rgba(17, 34, 51, 0)'
      );
    });
  });

  test('uses the fallback RGB value for an invalid color string', () => {
    const { container } = render(<HeroFlowLines colors="not-a-valid-color" />);

    const root = container.firstElementChild;

    createElementSizeController(root, {
      width: 200,
      height: 100,
    });

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    const context = canvasController.latestContext;

    context.gradients.length = 0;
    context.createLinearGradient.mockClear();

    animationFrameController.runNextFrame();

    expect(context.gradients).toHaveLength(3);

    expect(context.gradients[0].addColorStop).toHaveBeenCalledWith(
      0,
      'rgba(229, 217, 182, 0)'
    );

    expect(context.gradients[1].addColorStop).toHaveBeenCalledWith(
      0.5,
      'rgba(229, 217, 182, 0.3)'
    );
  });

  test('pauses outside the viewport and resumes when the element becomes active again', () => {
    const { container } = render(<HeroFlowLines />);

    const root = container.firstElementChild;
    const observer = intersectionController.latestObserver;

    expect(animationFrameController.pendingFrameCount).toBe(1);

    const scheduledCallback =
      animationFrameController.requestAnimationFrameMock.mock.calls.at(-1)[0];

    act(() => {
      observer.setIsIntersecting(false, root);
    });

    expect(
      animationFrameController.cancelAnimationFrameMock
    ).toHaveBeenCalledTimes(1);

    expect(animationFrameController.pendingFrameCount).toBe(0);

    // Ein bereits gespeicherter Callback darf im inaktiven
    // Zustand keine weitere Animation einplanen.
    scheduledCallback(32);

    expect(animationFrameController.pendingFrameCount).toBe(0);

    act(() => {
      observer.setIsIntersecting(true, root);
    });

    expect(animationFrameController.pendingFrameCount).toBe(1);

    expect(
      animationFrameController.requestAnimationFrameMock.mock.calls.length
    ).toBeGreaterThan(1);
  });

  test('does not start while the document is hidden and resumes once it becomes visible', () => {
    const visibilityController = createDocumentVisibilityController('hidden');

    render(<HeroFlowLines />);

    expect(animationFrameController.pendingFrameCount).toBe(0);

    act(() => {
      visibilityController.setVisibility('visible');
    });

    expect(animationFrameController.pendingFrameCount).toBe(1);

    act(() => {
      visibilityController.setVisibility('hidden');
    });

    expect(animationFrameController.pendingFrameCount).toBe(0);

    expect(
      animationFrameController.cancelAnimationFrameMock
    ).toHaveBeenCalled();
  });

  test('uses a device pixel ratio fallback and safely handles a detached canvas', () => {
    createDevicePixelRatioController(0);

    const { container } = render(<HeroFlowLines />);

    const root = container.firstElementChild;
    const canvas = container.querySelector('canvas');

    createElementSizeController(root, {
      width: 320,
      height: 180,
    });

    const context = canvasController.latestContext;

    context.scale.mockClear();

    act(() => {
      window.dispatchEvent(new Event('resize'));
    });

    expect(canvas.width).toBe(320);
    expect(canvas.height).toBe(180);
    expect(context.scale).toHaveBeenCalledWith(1, 1);

    canvas.remove();

    expect(() => {
      act(() => {
        window.dispatchEvent(new Event('resize'));
      });
    }).not.toThrow();
  });

  test('removes the resize listener and cancels the pending frame during cleanup', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

    const { unmount } = render(<HeroFlowLines />);

    expect(animationFrameController.pendingFrameCount).toBe(1);

    const scheduledCallback =
      animationFrameController.requestAnimationFrameMock.mock.calls.at(-1)[0];

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      'resize',
      expect.any(Function)
    );

    expect(
      animationFrameController.cancelAnimationFrameMock
    ).toHaveBeenCalled();

    expect(animationFrameController.pendingFrameCount).toBe(0);

    // Auch ein alter Callback darf nach dem Unmount
    // keinen neuen Frame erzeugen.
    scheduledCallback(48);

    expect(animationFrameController.pendingFrameCount).toBe(0);
  });

  test('cleans up without cancelling when the animation was already paused', () => {
    const { container, unmount } = render(<HeroFlowLines />);

    const root = container.firstElementChild;

    act(() => {
      intersectionController.latestObserver.setIsIntersecting(false, root);
    });

    const cancellationCount =
      animationFrameController.cancelAnimationFrameMock.mock.calls.length;

    expect(animationFrameController.pendingFrameCount).toBe(0);

    unmount();

    expect(
      animationFrameController.cancelAnimationFrameMock.mock.calls.length
    ).toBe(cancellationCount);
  });
});
