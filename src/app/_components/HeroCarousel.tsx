'use client'

import { useState, useEffect } from 'react'
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi'

interface Slide {
  id: number
  tag: string
  title: string
  subtitle: string
  buttonText: string
  imageUrl: string
  bgClass: string
}

const SLIDES: Slide[] = [
  {
    id: 1,
    tag: '#BigFashionSale',
    title: 'Limited Time Offer!\nUp to 50% OFF!',
    subtitle: 'Redefine Your Everyday Style',
    buttonText: 'Belanja Sekarang',
    imageUrl: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&q=80&w=800',
    bgClass: 'bg-slate-50 dark:bg-zinc-900',
  },
  {
    id: 2,
    tag: '#LocalPrideIndonesian',
    title: 'Koleksi Lokal\nKualitas Ekspor',
    subtitle: 'Dibuat dengan bangga oleh pengrajin UMKM terpilih',
    buttonText: 'Lihat Koleksi',
    imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=800',
    bgClass: 'bg-slate-50 dark:bg-zinc-900/50',
  },
]

export function HeroCarousel() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1))
    }, 5000)
    return () => clearInterval(timer)
  }, [])

  const nextSlide = () => {
    setCurrent((prev) => (prev === SLIDES.length - 1 ? 0 : prev + 1))
  }

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1))
  }

  return (
    <div className="relative overflow-hidden bg-zinc-50 dark:bg-zinc-900/40">
      <div 
        className="flex transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {SLIDES.map((slide) => (
          <div key={slide.id} className={`w-full flex-shrink-0 ${slide.bgClass || ''}`}>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 min-h-[420px] items-center py-8 sm:py-12 lg:py-16 gap-8">
              {/* Left Column: Promo text */}
              <div className="space-y-6 flex flex-col justify-center text-left">
                <span className="inline-block text-xs sm:text-sm font-semibold tracking-wider text-zinc-500 uppercase">
                  {slide.tag}
                </span>

                {/* Mobile Image Showcase - only on mobile */}
                <div className="md:hidden relative h-64 w-full rounded-2xl overflow-hidden shadow-lg shadow-zinc-200/50 dark:shadow-none">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={slide.imageUrl}
                    alt="Showcase"
                    className="absolute inset-0 h-full w-full object-cover transform hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                </div>

                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white leading-[1.15] whitespace-pre-line animate-fade-in-up">
                  {slide.title}
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base lg:text-lg">
                  {slide.subtitle}
                </p>
                <div>
                  <a
                    href="#catalog"
                    className="inline-flex h-11 items-center justify-center rounded-full bg-zinc-950 px-6 text-sm font-medium text-white hover:bg-zinc-800 transition-all dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
                  >
                    {slide.buttonText}
                  </a>
                </div>
              </div>

              {/* Right Column: Visual Showcase */}
              <div className="hidden md:block relative h-64 md:h-full w-full rounded-2xl overflow-hidden shadow-lg shadow-zinc-200/50 dark:shadow-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={slide.imageUrl}
                  alt="Showcase"
                  className="absolute inset-0 h-full w-full object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button 
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 hidden md:flex h-10 w-10 items-center justify-center rounded-full hover:bg-white text-zinc-400 hover:text-zinc-700 transition-all focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/80 dark:hover:bg-zinc-950 dark:text-white"
      >
        <FiChevronLeft className="h-8 w-8" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 hidden md:flex h-10 w-10 items-center justify-center rounded-full hover:bg-white text-zinc-400 hover:text-zinc-700 transition-all focus:outline-none dark:border-zinc-800 dark:bg-zinc-950/80 dark:hover:bg-zinc-950 dark:text-white"
      >
        <FiChevronRight className="h-8 w-8" />
      </button>

      {/* Slider indicators (dots) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              current === index ? 'w-6 bg-zinc-950 dark:bg-white' : 'w-2 bg-zinc-300 dark:bg-zinc-700'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
