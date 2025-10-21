"use client"

import { useState } from 'react'

export default function POSApp() {
  const [itemCode, setItemCode] = useState('')
  const [cart, setCart] = useState([])

  const API_ENDPOINT = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:8000'

  // 商品検索
  const searchItem = async (code = null) => {
    const searchCode = code || itemCode
    if (!searchCode.trim()) {
      alert('商品コードを入力してください')
      return
    }

    try {
      const response = await fetch(`${API_ENDPOINT}/items/${searchCode}`)
      if (!response.ok) {
        alert('商品が見つかりません')
        return
      }

      const item = await response.json()

      // カートに追加
      const existingItem = cart.find(c => c.item_id === item.item_id)
      if (existingItem) {
        setCart(cart.map(c =>
          c.item_id === item.item_id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        ))
      } else {
        setCart([...cart, { ...item, quantity: 1 }])
      }

      setItemCode('')
    } catch (error) {
      alert('商品が見つかりません')
    }
  }

  // 商品削除
  const removeItem = (item_id) => {
    setCart(cart.filter(item => item.item_id !== item_id))
  }

  // 数量変更
  const updateQuantity = (item_id, delta) => {
    setCart(cart.map(item => {
      if (item.item_id === item_id) {
        const newQuantity = item.quantity + delta
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : item
      }
      return item
    }).filter(item => item.quantity > 0))
  }

  // 合計金額計算
  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  // お会計処理
  const checkout = async () => {
    if (cart.length === 0) {
      alert('商品を追加してください')
      return
    }

    try {
      const purchaseData = {
        customer_id: "0000",
        items: cart.map(item => ({
          item_id: item.item_id,
          quantity: item.quantity
        }))
      }

      const response = await fetch(`${API_ENDPOINT}/purchases`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(purchaseData)
      })

      if (response.ok) {
        const result = await response.json()
        alert(`お会計完了\n合計金額: ¥${result.total_amount.toLocaleString()}`)
        setCart([])
      } else {
        alert('お会計に失敗しました')
      }
    } catch (error) {
      alert('エラーが発生しました')
    }
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '2rem' }}>POSアプリ</h1>

      {/* 商品コード入力 */}
      <div style={{ marginBottom: '2rem', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>商品コード入力</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={itemCode}
            onChange={(e) => setItemCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && searchItem()}
            placeholder="商品コードを入力"
            style={{
              flex: 1,
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
          <button
            onClick={searchItem}
            style={{
              padding: '10px 20px',
              backgroundColor: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '1rem'
            }}
          >
            商品を検索
          </button>
        </div>
      </div>

      {/* 購入リスト */}
      <div style={{ marginBottom: '2rem', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>購入リスト</h2>
        {cart.length === 0 ? (
          <p style={{ color: '#666' }}>商品がありません</p>
        ) : (
          <div>
            {cart.map(item => (
              <div
                key={item.item_id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '15px',
                  borderBottom: '1px solid #eee',
                  gap: '10px'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 'bold' }}>{item.item_name}</div>
                  <div style={{ fontSize: '0.875rem', color: '#666' }}>コード: {item.item_id}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <button
                    onClick={() => updateQuantity(item.item_id, -1)}
                    style={{
                      width: '30px',
                      height: '30px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      backgroundColor: 'white'
                    }}
                  >
                    -
                  </button>
                  <span style={{ minWidth: '30px', textAlign: 'center' }}>{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.item_id, 1)}
                    style={{
                      width: '30px',
                      height: '30px',
                      border: '1px solid #ddd',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      backgroundColor: 'white'
                    }}
                  >
                    +
                  </button>
                </div>
                <div style={{ minWidth: '100px', textAlign: 'right', fontWeight: 'bold' }}>
                  ¥{(item.price * item.quantity).toLocaleString()}
                </div>
                <button
                  onClick={() => removeItem(item.item_id)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#ff4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* お会計 */}
      <div style={{ padding: '20px', border: '2px solid #0070f3', borderRadius: '8px', backgroundColor: '#f0f8ff' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>合計金額</h2>
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0070f3' }}>
            ¥{totalAmount.toLocaleString()}
          </div>
        </div>
        <button
          onClick={checkout}
          disabled={cart.length === 0}
          style={{
            width: '100%',
            padding: '15px',
            backgroundColor: cart.length === 0 ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '1.25rem',
            fontWeight: 'bold'
          }}
        >
          お会計
        </button>
      </div>
    </div>
  )
}