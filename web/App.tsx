import React, { useCallback, useEffect, useRef, useState } from 'react';

import { event } from '@tauri-apps/api';
import { open } from '@tauri-apps/api/dialog';
import { dirname } from '@tauri-apps/api/path';
import { getCurrent } from '@tauri-apps/api/window';
import { convertFileSrc, invoke } from '@tauri-apps/api/tauri';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { ToolBar } from './ToolBar';
import empty from './empty.png';

import './App.scss';

export const App = () => {
  const [url, setUrl] = useState<string>(empty);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapObj: React.MutableRefObject<L.Map | null> = useRef(null);

  const readDir = async () => {
    const dir = await dirname(url);

    const list: string[] = await invoke('get_entries', {
      dir: dir.replace('asset://', ''),
    });

    return list;
  };

  const getZoom = (
    imageWidth: number,
    width: number,
    imageHeight: number,
    height: number
  ) => {
    if (imageWidth > width || imageHeight > height) {
      const zoomX = width / imageWidth;
      const zoomY = height / imageHeight;

      return zoomX >= zoomY ? zoomY : zoomX;
    } else {
      return 1;
    }
  };

  const draw = useCallback(
    (width: number, height: number) => {
      const node = mapRef.current;

      if (node) {
        const image = new Image();
        image.onload = () => {
          const zoom = getZoom(image.width, width, image.height, height);

          const bounds = new L.LatLngBounds([
            [image.height * zoom, 0],
            [0, image.width * zoom],
          ]);

          if (mapObj.current) {
            mapObj.current.off();
            mapObj.current.remove();
          }

          mapObj.current = L.map(node, {
            maxBounds: bounds,
            crs: L.CRS.Simple,
            preferCanvas: true,
            zoomDelta: 0.3,
            zoomSnap: 0.3,
            wheelPxPerZoomLevel: 360,
            doubleClickZoom: false,
            zoomControl: false,
            attributionControl: false,
          }).fitBounds(bounds);

          mapObj.current.on('dblclick', () => {
            const center = bounds.getCenter();
            mapObj.current && mapObj.current.setView(center, 0);
          });

          if (image.width < width && image.height < height) {
            const center = bounds.getCenter();
            mapObj.current.setView(center, 0, { animate: false });
          }

          L.imageOverlay(image.src, bounds).addTo(mapObj.current);

          node.blur();
          node.focus();
        };
        image.src = convertFileSrc(url);
      }
    },
    [url]
  );

  const preventDefault = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const onOpen = () => {
    open({
      multiple: false,
      directory: false,
      filters: [
        {
          name: 'Image file',
          extensions: ['ico', 'gif', 'png', 'jpg', 'jpeg', 'webp'],
        },
      ],
    }).then((filepath) => {
      if (!filepath || Array.isArray(filepath)) return;
      setUrl(filepath);
    });
  };

  const onNext = async () => {
    if (url === empty) return;

    const list = await readDir();
    if (!list || list.length === 0) {
      window.location.reload();
      return;
    }
    if (list.length === 1) return;

    const index = list.indexOf(url);
    if (index === list.length - 1 || index === -1) {
      setUrl(list[0]);
    } else {
      setUrl(list[index + 1]);
    }
  };

  const onPrev = async () => {
    if (url === empty) return;

    const list = await readDir();
    if (!list || list.length === 0) {
      window.location.reload();
      return;
    }
    if (list.length === 1) return;

    const index = list.indexOf(url);
    if (index === 0) {
      setUrl(list[list.length - 1]);
    } else if (index === -1) {
      setUrl(list[0]);
    } else {
      setUrl(list[index - 1]);
    }
  };

  const onRemove = async () => {
    if (url === empty) return;

    const list = await readDir();
    if (!list || list.length === 0) {
      window.location.reload();
      return;
    }

    const index = list.indexOf(url);
    await invoke('move_to_trash', { url }).catch((err) => {
      console.log(`Error in move_to_trash(): ${err}`);
      window.location.reload();
      return;
    });

    const newList = await readDir();
    if (!newList || newList.length === 0) {
      window.location.reload();
      return;
    }

    if (index > newList.length - 1) {
      setUrl(newList[0]);
    } else {
      setUrl(newList[index]);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (url === empty) return;

    switch (e.key) {
      case '0':
        mapObj.current && mapObj.current.setZoom(0);
        break;
      case e.metaKey && 'ArrowRight':
      case 'j':
        onNext();
        break;
      case e.metaKey && 'ArrowLeft':
      case 'k':
        onPrev();
        break;
      case 'Delete':
        onRemove();
        break;
      default:
        return;
    }
  };

  useEffect(() => {
    const unlistenFn = async () => {
      return await event.listen(
        'tauri://file-drop',
        async (e: event.Event<string[]>) => {
          const filepath = e.payload[0];
          const mimeSafe: boolean = await invoke('mime_check', { filepath });
          if (!mimeSafe) return;

          setUrl(e.payload[0]);
        }
      );
    };
    unlistenFn();
  }, []);

  useEffect(() => {
    const unlistenFn = async () => {
      return await event.listen('open', async () => {
        onOpen();
      });
    };
    unlistenFn();
  }, []);

  useEffect(() => {
    const currentWindow = getCurrent();

    if (url === empty) {
      currentWindow.setTitle('LeafView');
    } else {
      currentWindow.setTitle(url.replace(/.+(\/|\\)/, ''));
    }
  }, [url]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(
      (entries: ResizeObserverEntry[]) => {
        const width = entries[0].contentRect.width;
        const height = entries[0].contentRect.height;

        draw(width, height);
      }
    );

    mapRef.current && resizeObserver.observe(mapRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [draw]);

  return (
    <div
      className="container"
      onKeyDown={onKeyDown}
      onDrop={preventDefault}
      onDragOver={preventDefault}
      onDragEnter={preventDefault}
      onDragLeave={preventDefault}
    >
      <div className="bottom">
        <ToolBar
          onOpen={onOpen}
          onPrev={onPrev}
          onNext={onNext}
          onRemove={onRemove}
        />
      </div>
      <div className={url === empty ? 'view init' : 'view'} ref={mapRef} />
    </div>
  );
};
