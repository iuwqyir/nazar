import React, { useState } from 'react';
import { Group } from '@visx/group';
import { hierarchy, Tree } from '@visx/hierarchy';
import { LinearGradient } from '@visx/gradient';
import useForceUpdate from './useForceUpdate';
import getLinkComponent from './getLinkComponent';


interface TreeNode {
  name: string;
  isExpanded?: boolean;
  children?: TreeNode[];
}


const defaultMargin = { top: 30, left: 30, right: 30, bottom: 70 };

export type LinkTypesProps = {
  width: number;
  height: number;
  margin?: { top: number; right: number; bottom: number; left: number };
  data: any;
};

export default function TransactionFlow({
  width: totalWidth,
  height: totalHeight,
  margin = defaultMargin,
  data
}: LinkTypesProps) {
  const [layout, setLayout] = useState<string>('cartesian');
  const [orientation, setOrientation] = useState<string>('horizontal');
  const [linkType, setLinkType] = useState<string>('diagonal');
  const [stepPercent, setStepPercent] = useState<number>(0.5);
  const forceUpdate = useForceUpdate();

  const innerWidth = totalWidth - margin.left - margin.right;
  const innerHeight = totalHeight - margin.top - margin.bottom;

  let origin: { x: number; y: number };
  let sizeWidth: number;
  let sizeHeight: number;

  if (layout === 'polar') {
    origin = {
      x: innerWidth / 2,
      y: innerHeight / 2
    };
    sizeWidth = 2 * Math.PI;
    sizeHeight = Math.min(innerWidth, innerHeight) / 2;
  } else {
    origin = { x: 0, y: 0 };
    if (orientation === 'vertical') {
      sizeWidth = innerWidth;
      sizeHeight = innerHeight;
    } else {
      sizeWidth = innerHeight;
      sizeHeight = innerWidth;
    }
  }

  const getStrokeColor = (tree: any, node) => {
    if (tree?.data?.error) return 'red'

    return node?.source?.data?.error ? 'red' : '#35A29F'
  }

  const getFillFromType = (type: string, tree, node) => {

    if (getStrokeColor(tree, node) === 'red') return 'red'
    // const fillColors = {
    //     CALL: 'blue',
    //     DELEGATECALL: 'black',
    //     FORWARDCALL: 'green',
    //     STATICCALL: 'red',
    //     CREATE2: 'black'
    // }
    const fillColors = {
        CALL: 'blue',        // Medium blue
        DELEGATECALL: '#00bfa0', // Dark gray
        FORWARDCALL: '#32CD32',  // Lime green
        STATICCALL: '#9b19f5',   // Purple
        CREATE2: '#000000'       // Black
    };
    
    return fillColors[type]
  }

  const getStrokeWith = (number, treeLength) => {
    let correctedWidth = treeLength > 20 ? number * 10 : number * 100
    if (treeLength < 10 ) correctedWidth = correctedWidth / 10

    return correctedWidth
  }

  const LinkComponent = getLinkComponent({ layout, linkType, orientation });

  return totalWidth < 10 ? null : (
    <div>
      {/* <LinkControls
        layout={layout}
        orientation={orientation}
        linkType={linkType}
        stepPercent={stepPercent}
        setLayout={setLayout}
        setOrientation={setOrientation}
        setLinkType={setLinkType}
        setStepPercent={setStepPercent}
      /> */}
      <svg width={totalWidth + 10} height={totalHeight}>
        <LinearGradient id="links-gradient" from="#fd9b93" to="#fe6e9e" />
        <rect width={totalWidth} height={totalHeight} rx={14} fill="#fff" />
        <Group top={margin.top} left={margin.left}>
          <Tree
            root={hierarchy(data, (d) => (d.isExpanded ? null : d.children))}
            size={[sizeWidth, sizeHeight]}
            separation={(a, b) => (a.parent === b.parent ? 1 : 0.5) / a.depth}
          >
            {(tree) => (
              <Group top={origin.y} left={origin.x}>
                {tree.links().map((link, i, h) => {
                    return (<LinkComponent
                      key={i}
                      data={link}
                      percent={stepPercent}
                      stroke={getStrokeColor(tree, h[i])}
                      strokeWidth={getStrokeWith(h[i].target.data.gasParsed / tree.data.gasParsed, h.length)}
                      fill="none"
                    />)
                })}

                {tree.descendants().map((node, key, h) => {
                  const width = 80;
                  const height = 25;
                  let top: number = node.x;
                  let left: number = node.y;

                  return (
                    <Group top={top} left={left} key={key}>
                      {node.depth === 0 && (
                        <circle
                          r={22}
                          fill="url('#links-gradient')"
                          onClick={() => {
                            node.data.isExpanded = !node.data.isExpanded;
                            forceUpdate();
                          }}
                          onMouseOver={() => {
                            console.log('show tooltip here')
                          }}
                        />
                        )}
                      {node.depth !== 0 && (
                          <rect
                          height={height}
                          width={width}
                          y={-height / 2}
                          x={-width / 2}
                          fill="#fff"
                          //   stroke={node.data.children ? '#03c0dc' : '#26deb0'}
                          stroke={getFillFromType(node.data.type, tree, node)}
                          //   strokeWidth={node.data.gasParsed / 100000}
                          strokeWidth={1}
                          strokeDasharray={node.data.children ? '0' : '2,2'}
                          strokeOpacity={node.data.children ? 1 : 0.6}
                          rx={node.data.children ? 0 : 10}
                          onClick={() => {
                            node.data.isExpanded = !node.data.isExpanded;
                            console.log(node);
                            forceUpdate();
                          }}
                        />
                      )}
                          <text
                            dy=".33em"
                            fontSize={9}
                            // fontFamily="Arial"
                            textAnchor="middle"
                            style={{ pointerEvents: 'none' }}
                            fill={getFillFromType(node.data.type, tree, node)}
                          >
                            {node.data.type}
                          </text>
                    </Group>
                  );
                })}
              </Group>
            )}
          </Tree>
        </Group>
      </svg>
    </div>
  );
}
