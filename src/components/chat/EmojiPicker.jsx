import React from 'react';
import { EMOJI_CATEGORIES } from './emojiData';

const EmojiPicker = ({
    show,
    pickerRef,
    currentCategory,
    onCategoryChange,
    onEmojiSelect
}) => {
    if (!show) return null;

    return (
        <div ref={pickerRef} className="bg-white border-t border-slate-200 shadow-lg">
            {/* Category tabs */}
            <div className="flex border-b border-slate-100 px-1 pt-1 overflow-x-auto">
                {Object.entries(EMOJI_CATEGORIES).map(([key, category]) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => onCategoryChange(key)}
                        className={`p-2 text-lg hover:bg-slate-100 rounded-t transition-colors flex-shrink-0 ${currentCategory === key ? 'bg-slate-100 border-b-2 border-[#0d59f2]' : ''
                            }`}
                        title={category.label}
                    >
                        {category.icon}
                    </button>
                ))}
            </div>

            {/* Emoji grid */}
            <div className="h-40 overflow-y-auto p-2">
                <div className="grid grid-cols-8 gap-0.5">
                    {EMOJI_CATEGORIES[currentCategory].emojis.map((emoji, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => onEmojiSelect(emoji)}
                            className="text-xl hover:bg-slate-100 p-1.5 rounded transition-colors"
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default EmojiPicker;
