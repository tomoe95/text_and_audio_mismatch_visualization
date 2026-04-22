import { useEffect, useRef } from 'react'
import * as d3 from 'd3'

import './radarChart.css'

interface FourEmotions {
    joy: number
    optimism: number
    anger: number
    sadness: number
}

interface RadarChartProps {
    audio?: FourEmotions
    text?: FourEmotions
}


// example data set
const AUDIO: FourEmotions = {joy: 50, optimism: 15, anger: 20, sadness:15 }
const TEXT: FourEmotions = {joy: 10, optimism: 40, anger: 30, sadness:20 }

const SIZE = 340
const CX = SIZE / 2
const CY = SIZE / 2
const RADIUS = 110

const AXES = [
    { key: 'joy', label: '😄 Joy', angle: -90, audioDy: -14, textDy: 0 },
    { key: 'optimism', label: '🌿 Optimism', angle: 0, audioDy: -9, textDy: 9 },
    { key: 'sadness', label: '💧 Sadness', angle: 90, audioDy: -14, textDy: 0 },
    { key: 'anger', label: '🔥 Anger', angle: 180, audioDy: -9, textDy: 9 },
]

const COLOR_AUDIO = '#6366f1' // indigo
const COLOR_TEXT = '#f59e0b' // amber


function toRad(deg: number) {
    return deg * (Math.PI / 180)
}

function emotionToPoint(emotion: FourEmotions, key: string, angle: number, maxVal: number) {
    const value = (emotion as any)[key] / maxVal // [0,1] relative to max value
    const r = value * RADIUS
    
    return {
        x: Math.cos(toRad(angle)) * r,
        y: Math.sin(toRad(angle)) * r,
    }
}

// SVG path syntax e.g.,"M10,10 L100,10 L10,100 Z"
function pointsToPath(points: {x: number, y: number}[]) {
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z'
}

export default function RadarChart({ audio = AUDIO, text = TEXT }: RadarChartProps) {
    const svgRef = useRef<SVGSVGElement>(null)

    useEffect(() => {
        if (!svgRef.current) return
        const svg = d3.select(svgRef.current) // access to SVG element
        svg.selectAll('*').remove() // remove all the child elements

        const g = svg.append('g').attr('transform', `translate(${CX},${CY})`) // group element <g> -> centering the SVG part

        // dynamic scaling
        const allValues = AXES.flatMap(ax => [
            (audio as any)[ax.key],
            (text as any)[ax.key],
        ])
        const maxVal = Math.max(...allValues)

        const levels = [25, 50, 75, 100]
        levels.forEach(level => {
            const r = (level / 100) * RADIUS
            const points = AXES.map(ax => ({
                x: Math.cos(toRad(ax.angle)) * r,
                y: Math.sin(toRad(ax.angle)) * r,
            }))
            g.append('path')
                .attr('d', pointsToPath(points))
                .attr('fill', 'none')
                .attr('stroke', '#e5e7eb')
                .attr('stroke-width', 0.8)
            
            // ring label
            g.append('text')
                .attr('x', 4)
                .attr('y', -r + 3)
                .attr('font-size', '10px')
                .attr('font-family', 'monospace')
                .text(`${Math.round(maxVal * level / 100)}%`)
        })


        AXES.forEach(ax => {
            const end = {
                x: Math.cos(toRad(ax.angle)) * RADIUS,
                y: Math.sin(toRad(ax.angle)) * RADIUS,
            }
            g.append('line')
                .attr('x1', 0).attr('y1', 0)
                .attr('x2', end.x).attr('y2', end.y)
                .attr('stroke', '#e5e7eb')
                .attr('stroke-width', 0.8)
        })


        const audioPoints = AXES.map(ax => emotionToPoint(audio, ax.key, ax.angle, maxVal))
        g.append('path')
            .attr('d', pointsToPath(audioPoints))
            .attr('fill', COLOR_AUDIO)
            .attr('fill-opacity', 0.3)
            .attr('stroke', COLOR_AUDIO)
            .attr('stroke-width', 1.5)
            .attr('stroke-linejoin', 'round')

        audioPoints.forEach(p => {
            g.append('circle')
                .attr('cx', p.x).attr('cy', p.y).attr('r', 3)
                .attr('fill', COLOR_AUDIO)
        })


        const textPoints = AXES.map(ax => emotionToPoint(text, ax.key, ax.angle, maxVal))
            g.append('path')
                .attr('d', pointsToPath(textPoints))
                .attr('fill', COLOR_TEXT)
                .attr('fill-opacity', 0.3)
                .attr('stroke', COLOR_TEXT)
                .attr('stroke-width', 1.5)
                .attr('stroke-linejoin', 'round')

            textPoints.forEach(p => {
                g.append('circle')
                    .attr('cx', p.x).attr('cy', p.y).attr('r', 3)
                    .attr('fill', COLOR_TEXT)
            })

            // axis label 
            const LABEL_OFFSET = 28
            AXES.forEach(ax => {
                const lx = Math.cos(toRad(ax.angle)) * (RADIUS + LABEL_OFFSET)
                const ly = Math.sin(toRad(ax.angle)) * (RADIUS + LABEL_OFFSET)

                g.append('text')
                    .attr('x', lx)
                    .attr('y', ly)
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .attr('font-size', '15px')
                    .text(ax.label.split(' ')[0]) // emoji only
    
                // value label (audio)
                const audioVal = (audio as any)[ax.key]
                const avx = Math.cos(toRad(ax.angle)) * (RADIUS + LABEL_OFFSET + 30)
                const avy = Math.sin(toRad(ax.angle)) * (RADIUS + LABEL_OFFSET + 30) + ax.audioDy // place vertically
                g.append('text')
                    .attr('x', avx).attr('y', avy)
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .attr('font-size', '12px')
                    .attr('fill', COLOR_AUDIO)
                    .text(`${audioVal} %`)


                // value label (text)
                const textVal = (text as any)[ax.key]
                const tvx = Math.cos(toRad(ax.angle)) * (RADIUS + LABEL_OFFSET + 30)
                const tvy = Math.sin(toRad(ax.angle)) * (RADIUS + LABEL_OFFSET + 30) + ax.textDy
                g.append('text')
                    .attr('x', tvx).attr('y', tvy)
                    .attr('text-anchor', 'middle')
                    .attr('dominant-baseline', 'middle')
                    .attr('font-size', '12px')
                    .attr('fill', COLOR_TEXT)
                    .text(`${textVal} %`)
            })
    }, [audio, text])

    return (
        <div className='radar-container'>
            <div className='radar-wrapper'>
                <svg ref={svgRef} width={SIZE} height={SIZE} style={{ overflow: 'visible' }}/>
            
                <div className='radar-legend'>
                    <div className='radar-legend-item'>
                        <svg width='24' height='10'>
                            <line x1='0' y1='5' x2='24' y2='5' stroke={COLOR_AUDIO} strokeWidth='2' />
                            <circle cx='12' cy='5' r='3' fill={COLOR_AUDIO} />
                        </svg>
                        <span className='radar-legend-label'>Audio</span>
                    </div>
                    <div className='radar-legend-item'>
                        <svg width='24' height='10'>
                            <line x1='0' y1='5' x2='24' y2='5' stroke={COLOR_TEXT} strokeWidth='2' />
                            <circle cx='12' cy='5' r='3' fill={COLOR_TEXT}/>
                        </svg>
                        <span className='radar-legend-label'>Text</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

