'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TravelSearchForm from './TravelSearchForm'
import RentalSearchForm from './RentalSearchForm'

type Tab = 'travel' | 'rental'

const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: 'travel', label: 'Travel Antar Kota', icon: '🚌' },
  { key: 'rental', label: 'Rental Mobil', icon: '🚗' },
]

export default function SearchBox() {
  const [activeTab, setActiveTab] = useState<Tab>('travel')

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Tab Switcher */}
      <div className="flex justify-center mb-4">
        <div className="inline-flex bg-white/15 backdrop-blur-sm rounded-full p-1 gap-1">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`relative px-5 py-2.5 rounded-full text-sm font-semibold transition-colors duration-200 ${
                activeTab === tab.key
                  ? 'text-primary'
                  : 'text-white/80 hover:text-white'
              }`}
            >
              {activeTab === tab.key && (
                <motion.span
                  layoutId="search-tab-bg"
                  className="absolute inset-0 bg-white rounded-full shadow-sm"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative flex items-center gap-2">
                <span>{tab.icon}</span>
                {tab.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Card */}
      <motion.div
        className="bg-white rounded-2xl shadow-panel p-6 md:p-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === 'travel' ? -12 : 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: activeTab === 'travel' ? 12 : -12 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'travel' ? <TravelSearchForm /> : <RentalSearchForm />}
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
