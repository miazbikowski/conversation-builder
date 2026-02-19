import { useState } from 'react'

// Recursive component to display a choice and its nested choices
function ChoiceCard({ choiceId, choice, allChoices, currentConv, selectedConversation, conversations, setConversations, depth = 0 }) {
  const [linkingOpen, setLinkingOpen] = useState(false)
  const tupleStr = (arr) => arr ? arr.map(([n, v]) => `${n}:${v}`).join(', ') : ''
  const [reqCondStr, setReqCondStr] = useState(() => tupleStr(choice.required_conditions))
  const [incrCondStr, setIncrCondStr] = useState(() => tupleStr(choice.increment_conditions))
  const [decrCondStr, setDecrCondStr] = useState(() => tupleStr(choice.decrement_conditions))

  const updateChoice = (updates) => {
    setConversations({
      ...conversations,
      [selectedConversation]: {
        ...currentConv,
        choices: {
          ...currentConv.choices,
          [choiceId]: {
            ...choice,
            ...updates
          }
        }
      }
    })
  }

  const handleAddNestedChoice = () => {
    const newId = getNextChoiceId(currentConv.choices)
    setConversations({
      ...conversations,
      [selectedConversation]: {
        ...currentConv,
        choices: {
          ...currentConv.choices,
          [newId]: { text: '', response: '' },
          [choiceId]: {
            ...choice,
            choices: [...(choice.choices || []), newId]
          }
        }
      }
    })
  }

  const depthColors = [
    { border: '', accent: 'text-purple-700' },
    { border: 'border-l-4 border-blue-400',   accent: 'text-blue-700'   },
    { border: 'border-l-4 border-teal-400',   accent: 'text-teal-700'   },
    { border: 'border-l-4 border-green-400',  accent: 'text-green-700'  },
    { border: 'border-l-4 border-yellow-400', accent: 'text-yellow-700' },
    { border: 'border-l-4 border-orange-400', accent: 'text-orange-700' },
  ]
  const { border, accent } = depthColors[Math.min(depth, depthColors.length - 1)]

  const hasNoChildren = !choice.choices || choice.choices.length === 0
  const isInvalid = hasNoChildren && !choice.return_to_root && !choice.force_exit

  return (
    <div className={`border rounded-lg p-4 bg-gray-50 ${depth > 0 ? `ml-4 mt-3 ${border}` : ''} ${isInvalid ? 'border-red-400' : ''}`}>
      {/* Choice Header */}
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <h4 className={`font-semibold ${accent}`}>
            {choiceId} {depth > 0 && <span className="text-xs text-gray-500">(nested)</span>}
          </h4>
          {isInvalid && (
            <span className="text-xs text-red-600 font-medium">
              Must have choices, force exit, or return to root
            </span>
          )}
        </div>
        {depth === 0 && (
          <button
            onClick={() => {
              const newChoices = Object.fromEntries(
                Object.entries(currentConv.choices)
                  .filter(([id]) => id !== choiceId)
                  .map(([id, c]) => [id, c.choices
                    ? { ...c, choices: c.choices.filter(id2 => id2 !== choiceId) }
                    : c
                  ])
              )
              const newInteractions = Object.fromEntries(
                Object.entries(currentConv.interactions || {}).map(([key, interaction]) => [
                  key,
                  interaction.choices
                    ? { ...interaction, choices: interaction.choices.filter(id => id !== choiceId) }
                    : interaction
                ])
              )
              setConversations({
                ...conversations,
                [selectedConversation]: {
                  ...currentConv,
                  choices: newChoices,
                  interactions: newInteractions
                }
              })
            }}
            className="text-sm text-red-600 hover:text-red-800"
          >
            Delete
          </button>
        )}
      </div>

      {/* Required Conditions */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Required Conditions (format: name:value, name:value)
        </label>
        <input
          type="text"
          value={reqCondStr}
          onChange={(e) => {
            setReqCondStr(e.target.value)
            const conditions = e.target.value
              .split(',')
              .map(pair => {
                const [name, val] = pair.split(':').map(s => s.trim())
                return name && val !== undefined && val !== '' ? [name, isNaN(val) ? val : parseInt(val)] : null
              })
              .filter(pair => pair !== null)
            updateChoice({ required_conditions: conditions.length > 0 ? conditions : undefined })
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="e.g., kills:1, has_sword:1"
        />
      </div>

      {/* Choice Text */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Choice Text
        </label>
        <textarea
          value={choice.text || ''}
          onChange={(e) => updateChoice({ text: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          rows="5"
        />
      </div>

      {/* Response */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Response
        </label>
        {Array.isArray(choice.response) ? (
          choice.response.map((resp, idx) => (
            <textarea
              key={idx}
              value={resp}
              onChange={(e) => {
                const newResponse = [...choice.response]
                newResponse[idx] = e.target.value
                updateChoice({ response: newResponse })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
              rows="5"
            />
          ))
        ) : (
          <textarea
            value={choice.response || ''}
            onChange={(e) => updateChoice({ response: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows="5"
          />
        )}
      </div>

      {/* Metadata */}
      <div className="grid grid-cols-2 gap-4 mb-3">
        {/* Force Exit */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={choice.force_exit || false}
              onChange={(e) => updateChoice({ force_exit: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm font-medium">Force Exit</span>
          </label>
        </div>

        {/* Return to Root */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={choice.return_to_root || false}
              onChange={(e) => updateChoice({ return_to_root: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm font-medium">Return to Root</span>
          </label>
        </div>
      </div>

      {/* Add Goals */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Add Goals (comma-separated)
        </label>
        <input
          type="text"
          value={choice.add_goals ? choice.add_goals.join(', ') : ''}
          onChange={(e) => {
            const goals = e.target.value
              .split(',')
              .map(g => g.trim())
              .filter(g => g.length > 0)
            updateChoice({ add_goals: goals.length > 0 ? goals : undefined })
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="e.g., vicar_water_quest, conquer_the_island"
        />
      </div>

      {/* Add Conditions */}
      <div className="mb-3">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Add Conditions (comma-separated)
        </label>
        <input
          type="text"
          value={choice.add_conditions ? choice.add_conditions.join(', ') : ''}
          onChange={(e) => {
            const conditions = e.target.value
              .split(',')
              .map(c => c.trim())
              .filter(c => c.length > 0)
            updateChoice({ add_conditions: conditions.length > 0 ? conditions : undefined })
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-md"
          placeholder="e.g., killed_bunktek_survivor"
        />
      </div>

      {/* Advanced Options - Collapsible */}
      <details className="mb-3">
        <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 select-none">
          Advanced Options (conditions & goals)
        </summary>
        <div className="mt-3 space-y-3 pl-4 border-l-2 border-gray-200">
          {/* Remove Goals */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remove Goals (comma-separated)
            </label>
            <input
              type="text"
              value={choice.remove_goals ? choice.remove_goals.join(', ') : ''}
              onChange={(e) => {
                const goals = e.target.value
                  .split(',')
                  .map(g => g.trim())
                  .filter(g => g.length > 0)
                updateChoice({ remove_goals: goals.length > 0 ? goals : undefined })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="e.g., old_quest"
            />
          </div>

          {/* Remove Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Remove Conditions (comma-separated)
            </label>
            <input
              type="text"
              value={choice.remove_conditions ? choice.remove_conditions.join(', ') : ''}
              onChange={(e) => {
                const conditions = e.target.value
                  .split(',')
                  .map(c => c.trim())
                  .filter(c => c.length > 0)
                updateChoice({ remove_conditions: conditions.length > 0 ? conditions : undefined })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="e.g., temporary_buff"
            />
          </div>

          {/* Increment Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Increment Conditions (format: name:amount, name:amount)
            </label>
            <input
              type="text"
              value={incrCondStr}
              onChange={(e) => {
                setIncrCondStr(e.target.value)
                const increments = e.target.value
                  .split(',')
                  .map(pair => {
                    const [name, amt] = pair.split(':').map(s => s.trim())
                    return name && amt ? [name, parseInt(amt) || 1] : null
                  })
                  .filter(pair => pair !== null)
                updateChoice({ increment_conditions: increments.length > 0 ? increments : undefined })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="e.g., kills:1, damage_dealt:50"
            />
          </div>

          {/* Decrement Conditions */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Decrement Conditions (format: name:amount, name:amount)
            </label>
            <input
              type="text"
              value={decrCondStr}
              onChange={(e) => {
                setDecrCondStr(e.target.value)
                const decrements = e.target.value
                  .split(',')
                  .map(pair => {
                    const [name, amt] = pair.split(':').map(s => s.trim())
                    return name && amt ? [name, parseInt(amt) || 1] : null
                  })
                  .filter(pair => pair !== null)
                updateChoice({ decrement_conditions: decrements.length > 0 ? decrements : undefined })
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="e.g., health:10, stamina:5"
            />
          </div>
        </div>
      </details>

      {/* Nested Choices - Recursive */}
      {!choice.return_to_root && !choice.force_exit && (
        <div className="mt-3 pt-3 border-t">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Leads to:
            </label>
            <div className="flex gap-2">
              <button
                onClick={handleAddNestedChoice}
                className="text-sm px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
              >
                + New Choice
              </button>
              <button
                onClick={() => setLinkingOpen(v => !v)}
                className="text-sm px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                + Link Choice
              </button>
            </div>
          </div>
          {linkingOpen && (() => {
            const alreadyLinked = new Set(choice.choices || [])
            const linkable = Object.keys(allChoices).filter(id => id !== choiceId && !alreadyLinked.has(id))
            return (
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 text-sm"
                defaultValue=""
                onChange={(e) => {
                  if (!e.target.value) return
                  updateChoice({ choices: [...(choice.choices || []), e.target.value] })
                  setLinkingOpen(false)
                }}
              >
                <option value="" disabled>Select a choice to link…</option>
                {linkable.map(id => (
                  <option key={id} value={id}>
                    {id}{allChoices[id].text ? ` — ${allChoices[id].text.slice(0, 40)}` : ''}
                  </option>
                ))}
              </select>
            )
          })()}
          {choice.choices && choice.choices.map(nestedChoiceId => {
            const nestedChoice = allChoices[nestedChoiceId]
            if (!nestedChoice) {
              return (
                <div key={nestedChoiceId} className="text-red-500 text-sm">
                  Missing choice: {nestedChoiceId}
                </div>
              )
            }
            return (
              <div key={nestedChoiceId} className="relative">
                <button
                  onClick={() => updateChoice({ choices: choice.choices.filter(id => id !== nestedChoiceId) })}
                  className="absolute top-2 right-2 z-10 text-xs text-orange-600 hover:text-orange-800"
                >
                  Unlink
                </button>
                <ChoiceCard
                  choiceId={nestedChoiceId}
                  choice={nestedChoice}
                  allChoices={allChoices}
                  currentConv={currentConv}
                  selectedConversation={selectedConversation}
                  conversations={conversations}
                  setConversations={setConversations}
                  depth={depth + 1}
                />
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const getNextChoiceId = (choices) => {
  const nums = Object.keys(choices || {})
    .map(k => k.match(/^choice(\d+)$/))
    .filter(Boolean)
    .map(m => parseInt(m[1]))
  return `choice${nums.length > 0 ? Math.max(...nums) + 1 : 1}`
}

function App() {
  const [conversations, setConversations] = useState({})
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [viewMode, setViewMode] = useState('overview') // 'overview' or 'choices'
  const [interactionLinkingOpen, setInteractionLinkingOpen] = useState(null)
  const [newConvName, setNewConvName] = useState('')
  const [newInteractionKey, setNewInteractionKey] = useState('')

  // Load JSON file
  const handleFileUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result)
          setConversations(data)
          // Select first conversation by default
          const firstKey = Object.keys(data)[0]
          if (firstKey) setSelectedConversation(firstKey)
        } catch (error) {
          alert('Invalid JSON file')
        }
      }
      reader.readAsText(file)
    }
  }

  // Export JSON
  const handleExport = () => {
    const dataStr = JSON.stringify(conversations, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'conversations.json'
    link.click()
  }

  const handleAddConversation = () => {
    const name = newConvName.trim()
    if (!name || conversations[name]) return
    setConversations({
      ...conversations,
      [name]: {
        description: '',
        name: '',
        interactions: {},
        choices: {}
      }
    })
    setSelectedConversation(name)
    setNewConvName('')
  }

  const handleAddInteraction = () => {
    const key = newInteractionKey.trim()
    if (!key || currentConv.interactions?.[key]) return
    setConversations({
      ...conversations,
      [selectedConversation]: {
        ...currentConv,
        interactions: {
          ...currentConv.interactions,
          [key]: { text: [''], choices: [] }
        }
      }
    })
    setNewInteractionKey('')
  }

  const currentConv = selectedConversation ? conversations[selectedConversation] : null

  const handleAddChoice = () => {
    const newId = getNextChoiceId(currentConv.choices)
    setConversations({
      ...conversations,
      [selectedConversation]: {
        ...currentConv,
        choices: {
          ...currentConv.choices,
          [newId]: { text: '', response: '' }
        }
      }
    })
  }


  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Conversation Editor</h1>
            <div className="flex gap-2">
              <label className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 cursor-pointer">
                Load JSON
                <input type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
              </label>
              <button
                onClick={handleExport}
                disabled={Object.keys(conversations).length === 0}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
              >
                Export JSON
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid grid-cols-4 gap-6">
            {/* Sidebar - Conversation List */}
            <div className="col-span-1">
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="font-semibold text-lg mb-4">Conversations</h2>
                <div className="space-y-2 mb-4">
                  {Object.keys(conversations).map(key => (
                    <button
                      key={key}
                      onClick={() => setSelectedConversation(key)}
                      className={`w-full text-left px-3 py-2 rounded ${
                        selectedConversation === key
                          ? 'bg-blue-100 text-blue-700 font-medium'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {key}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newConvName}
                    onChange={(e) => setNewConvName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddConversation()}
                    placeholder="new_npc"
                    className="flex-1 min-w-0 px-2 py-1 border border-gray-300 rounded text-sm"
                  />
                  <button
                    onClick={handleAddConversation}
                    disabled={!newConvName.trim() || !!conversations[newConvName.trim()]}
                    className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 text-sm"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>

            {/* Main Editor */}
            <div className="col-span-3">
              {currentConv && (
                <div className="bg-white rounded-lg shadow p-6">
                  {/* Header with view mode toggle */}
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{selectedConversation}</h2>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setViewMode('overview')}
                        className={`px-4 py-2 rounded ${
                          viewMode === 'overview'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Overview
                      </button>
                      <button
                        onClick={() => setViewMode('choices')}
                        className={`px-4 py-2 rounded ${
                          viewMode === 'choices'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        Choices
                      </button>
                    </div>
                  </div>

                  {viewMode === 'overview' ? (
                    <>
                      {/* Basic Info */}
                      <div className="mb-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        NPC Name
                      </label>
                      <input
                        type="text"
                        value={currentConv.name || ''}
                        onChange={(e) => {
                          setConversations({
                            ...conversations,
                            [selectedConversation]: {
                              ...currentConv,
                              name: e.target.value
                            }
                          })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                      </label>
                      <textarea
                        value={currentConv.description || ''}
                        onChange={(e) => {
                          setConversations({
                            ...conversations,
                            [selectedConversation]: {
                              ...currentConv,
                              description: e.target.value
                            }
                          })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        rows="5"
                      />
                    </div>
                  </div>

                  {/* Interactions */}
                  <div className="border-t pt-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Interactions</h3>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newInteractionKey}
                          onChange={(e) => setNewInteractionKey(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddInteraction()}
                          placeholder="interaction_key"
                          className="px-2 py-1 border border-gray-300 rounded text-sm w-36"
                        />
                        <button
                          onClick={handleAddInteraction}
                          disabled={!newInteractionKey.trim() || !!currentConv.interactions?.[newInteractionKey.trim()]}
                          className="px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400 text-sm"
                        >
                          + Add
                        </button>
                      </div>
                    </div>
                    {currentConv.interactions && Object.keys(currentConv.interactions).length > 0 ? (
                      <div className="space-y-4">
                        {Object.entries(currentConv.interactions).map(([interactionKey, interaction]) => (
                          <div key={interactionKey} className="border rounded-lg p-4 bg-gray-50">
                            {/* Interaction Header */}
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-semibold text-blue-700">{interactionKey}</h4>
                              <button
                                onClick={() => {
                                  const newInteractions = { ...currentConv.interactions }
                                  delete newInteractions[interactionKey]
                                  setConversations({
                                    ...conversations,
                                    [selectedConversation]: {
                                      ...currentConv,
                                      interactions: newInteractions
                                    }
                                  })
                                }}
                                className="text-sm text-red-600 hover:text-red-800"
                              >
                                Delete
                              </button>
                            </div>

                            {/* Text */}
                            <div className="mb-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Text
                              </label>
                              {Array.isArray(interaction.text) ? (
                                interaction.text.map((text, idx) => (
                                  <textarea
                                    key={idx}
                                    value={text}
                                    onChange={(e) => {
                                      const newText = [...interaction.text]
                                      newText[idx] = e.target.value
                                      setConversations({
                                        ...conversations,
                                        [selectedConversation]: {
                                          ...currentConv,
                                          interactions: {
                                            ...currentConv.interactions,
                                            [interactionKey]: {
                                              ...interaction,
                                              text: newText
                                            }
                                          }
                                        }
                                      })
                                    }}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2"
                                    rows="5"
                                  />
                                ))
                              ) : (
                                <textarea
                                  value={interaction.text || ''}
                                  onChange={(e) => {
                                    setConversations({
                                      ...conversations,
                                      [selectedConversation]: {
                                        ...currentConv,
                                        interactions: {
                                          ...currentConv.interactions,
                                          [interactionKey]: {
                                            ...interaction,
                                            text: e.target.value
                                          }
                                        }
                                      }
                                    })
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                  rows="5"
                                />
                              )}
                            </div>

                            {/* Condition Checks */}
                            <div className="mb-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Condition Checks (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={interaction.condition_checks ? interaction.condition_checks.join(', ') : ''}
                                onChange={(e) => {
                                  const checks = e.target.value
                                    .split(',')
                                    .map(c => c.trim())
                                    .filter(c => c.length > 0)
                                  setConversations({
                                    ...conversations,
                                    [selectedConversation]: {
                                      ...currentConv,
                                      interactions: {
                                        ...currentConv.interactions,
                                        [interactionKey]: {
                                          ...interaction,
                                          condition_checks: checks.length > 0 ? checks : undefined
                                        }
                                      }
                                    }
                                  })
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="e.g., has_sword, completed_quest"
                              />
                            </div>

                            {/* Goal Completed Checks */}
                            <div className="mb-3">
                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                Goal Completed Checks (format: name:value, name:value)
                              </label>
                              <input
                                type="text"
                                value={interaction.goal_completed_checks
                                  ? interaction.goal_completed_checks.map(([name, val]) => `${name}:${val}`).join(', ')
                                  : ''}
                                onChange={(e) => {
                                  const checks = e.target.value
                                    .split(',')
                                    .map(pair => {
                                      const [name, val] = pair.split(':').map(s => s.trim())
                                      return name && val !== undefined && val !== '' ? [name, isNaN(val) ? val : parseInt(val)] : null
                                    })
                                    .filter(pair => pair !== null)
                                  setConversations({
                                    ...conversations,
                                    [selectedConversation]: {
                                      ...currentConv,
                                      interactions: {
                                        ...currentConv.interactions,
                                        [interactionKey]: {
                                          ...interaction,
                                          goal_completed_checks: checks.length > 0 ? checks : undefined
                                        }
                                      }
                                    }
                                  })
                                }}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                                placeholder="e.g., main_quest:1, side_quest:0"
                              />
                            </div>

                            {/* Force Exit */}
                            <div className="mb-3">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={interaction.force_exit || false}
                                  onChange={(e) => {
                                    setConversations({
                                      ...conversations,
                                      [selectedConversation]: {
                                        ...currentConv,
                                        interactions: {
                                          ...currentConv.interactions,
                                          [interactionKey]: {
                                            ...interaction,
                                            force_exit: e.target.checked || undefined
                                          }
                                        }
                                      }
                                    })
                                  }}
                                  className="mr-2"
                                />
                                <span className="text-sm font-medium">Force Exit</span>
                              </label>
                            </div>

                            {/* Choices */}
                            <div className="mt-3 pt-3 border-t">
                              <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">Choices</label>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => setViewMode('choices')}
                                    className="text-sm px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                                  >
                                    View All
                                  </button>
                                  <button
                                    onClick={() => setInteractionLinkingOpen(
                                      interactionLinkingOpen === interactionKey ? null : interactionKey
                                    )}
                                    className="text-sm px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                                  >
                                    + Link Choice
                                  </button>
                                </div>
                              </div>
                              {interactionLinkingOpen === interactionKey && (() => {
                                const linked = new Set(interaction.choices || [])
                                const linkable = Object.keys(currentConv.choices || {}).filter(id => !linked.has(id))
                                return (
                                  <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 text-sm"
                                    defaultValue=""
                                    onChange={(e) => {
                                      if (!e.target.value) return
                                      setConversations({
                                        ...conversations,
                                        [selectedConversation]: {
                                          ...currentConv,
                                          interactions: {
                                            ...currentConv.interactions,
                                            [interactionKey]: {
                                              ...interaction,
                                              choices: [...(interaction.choices || []), e.target.value]
                                            }
                                          }
                                        }
                                      })
                                      setInteractionLinkingOpen(null)
                                    }}
                                  >
                                    <option value="" disabled>Select a choice to link…</option>
                                    {linkable.map(id => (
                                      <option key={id} value={id}>
                                        {id}{currentConv.choices[id].text ? ` — ${currentConv.choices[id].text.slice(0, 40)}` : ''}
                                      </option>
                                    ))}
                                  </select>
                                )
                              })()}
                              {interaction.choices && interaction.choices.length > 0 && (
                                <div className="space-y-1">
                                  {interaction.choices.map(id => (
                                    <div key={id} className="flex justify-between items-center px-2 py-1 bg-white border rounded text-sm">
                                      <span className="font-mono">{id}{currentConv.choices?.[id]?.text ? ` — ${currentConv.choices[id].text.slice(0, 40)}` : ''}</span>
                                      <button
                                        onClick={() => setConversations({
                                          ...conversations,
                                          [selectedConversation]: {
                                            ...currentConv,
                                            interactions: {
                                              ...currentConv.interactions,
                                              [interactionKey]: {
                                                ...interaction,
                                                choices: interaction.choices.filter(c => c !== id)
                                              }
                                            }
                                          }
                                        })}
                                        className="text-xs text-orange-600 hover:text-orange-800"
                                      >
                                        Unlink
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">No interactions yet</p>
                    )}
                  </div>
                    </>
                  ) : (
                    /* Choices View */
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">All Choices</h3>
                        <button
                          onClick={handleAddChoice}
                          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                        >
                          + New Choice
                        </button>
                      </div>
                      {currentConv.choices && Object.keys(currentConv.choices).length > 0 ? (() => {
                        const interactionRefs = new Set(
                          Object.values(currentConv.interactions || {}).flatMap(i => i.choices || [])
                        )
                        const choiceRefs = new Set(
                          Object.values(currentConv.choices).flatMap(c => c.choices || [])
                        )
                        const visible = Object.entries(currentConv.choices).filter(([id]) =>
                          interactionRefs.has(id) || !choiceRefs.has(id)
                        )
                        return (
                          <div className="space-y-4">
                            {visible.map(([choiceId, choice]) => (
                              <ChoiceCard
                                key={choiceId}
                                choiceId={choiceId}
                                choice={choice}
                                allChoices={currentConv.choices}
                                currentConv={currentConv}
                                selectedConversation={selectedConversation}
                                conversations={conversations}
                                setConversations={setConversations}
                                depth={0}
                              />
                            ))}
                          </div>
                        )
                      })() : (
                        <p className="text-gray-500 text-center py-4">No choices yet</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
      </div>
    </div>
  )
}

export default App
