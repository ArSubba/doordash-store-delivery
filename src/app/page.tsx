'use client'

import { Settings, ShoppingBag, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <ShoppingBag className="h-8 w-8 text-primary-500" />
              <span className="ml-2 text-xl font-bold text-gray-900">DeliveryStore</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Welcome to Your Store
          </h1>
          <p className="text-xl text-gray-600 mb-12 max-w-2xl mx-auto">
            Manage your delivery business with our comprehensive admin and customer platform
          </p>
        </div>

        {/* Dashboard Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Admin Dashboard Card */}
          <Link href="/admin" className="group">
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 group-hover:border-primary-200">
              <div className="flex items-center justify-center w-16 h-16 bg-primary-100 rounded-xl mb-6 mx-auto group-hover:bg-primary-200 transition-colors">
                <Settings className="h-8 w-8 text-primary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">Admin Dashboard</h2>
              <p className="text-gray-600 text-center mb-6">
                Manage your store, add products, set prices, track orders, and control everything
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4 text-primary-500 mr-2" />
                  Add & manage products
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4 text-primary-500 mr-2" />
                  Set prices & inventory
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4 text-primary-500 mr-2" />
                  Process orders & payments
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <TrendingUp className="h-4 w-4 text-primary-500 mr-2" />
                  View analytics & reports
                </div>
              </div>
              <div className="mt-6 text-center">
                <span className="text-primary-600 font-semibold group-hover:text-primary-700">
                  Access Admin Panel →
                </span>
              </div>
            </div>
          </Link>

          {/* Customer Dashboard Card */}
          <Link href="/customer" className="group">
            <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border border-gray-100 group-hover:border-secondary-200">
              <div className="flex items-center justify-center w-16 h-16 bg-secondary-100 rounded-xl mb-6 mx-auto group-hover:bg-secondary-200 transition-colors">
                <Users className="h-8 w-8 text-secondary-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 text-center mb-4">Customer Store</h2>
              <p className="text-gray-600 text-center mb-6">
                Browse products, add items to cart, place orders, and track deliveries
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <ShoppingBag className="h-4 w-4 text-secondary-500 mr-2" />
                  Browse available products
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <ShoppingBag className="h-4 w-4 text-secondary-500 mr-2" />
                  Add items to cart
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <ShoppingBag className="h-4 w-4 text-secondary-500 mr-2" />
                  Secure checkout & payment
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <ShoppingBag className="h-4 w-4 text-secondary-500 mr-2" />
                  Real-time order tracking
                </div>
              </div>
              <div className="mt-6 text-center">
                <span className="text-secondary-600 font-semibold group-hover:text-secondary-700">
                  Start Shopping →
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Features Section */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">System Features</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="font-semibold mb-2">Real-time Updates</h4>
              <p className="text-gray-600 text-sm">Live order tracking and inventory updates</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <ShoppingBag className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="font-semibold mb-2">Easy Management</h4>
              <p className="text-gray-600 text-sm">Simple product and order management</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <h4 className="font-semibold mb-2">Customer Focus</h4>
              <p className="text-gray-600 text-sm">Smooth ordering and delivery experience</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}