import type { TileCoordinate } from "../../../types";
import { getTilePosition, getTileUrl } from "../../../utils/tileUtils";
import { Tile } from "./Tile";

interface RenderTilesProps {
  tiles: TileCoordinate[];
  token: string;
  centerX: number;
  centerY: number;
  containerSize: {
    width: number;
    height: number;
  };
}

export const RenderTiles: React.FC<RenderTilesProps> = ({ tiles, token, centerX, centerY, containerSize }) => {
  return (
    <div
      className="relative"
      style={{
        width: containerSize.width,
        height: containerSize.height,
      }}
    >
      {tiles.map((tile) => {
        const position = getTilePosition(tile.x, tile.y, centerX, centerY, containerSize.width, containerSize.height);
        const url = getTileUrl(tile.x, tile.y, tile.z, token);

        return (
          <Tile
            key={`${tile.z}-${tile.x}-${tile.y}`}
            x={tile.x}
            y={tile.y}
            z={tile.z}
            url={url}
            style={{
              left: position.x,
              top: position.y,
            }}
          />
        );
      })}
    </div>
  );
};
