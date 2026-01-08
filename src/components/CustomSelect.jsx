import { useState, useRef, useEffect } from 'react';

function CustomSelect({ options, value, onChange, placeholder, icon, label, hint }) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className="relative" ref={dropdownRef}>
            {label && (
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    {label}
                </label>
            )}

            {/* Trigger Button */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center rounded-xl border bg-white py-2.5 pl-10 pr-10 text-sm shadow-sm transition-all cursor-pointer text-left ${isOpen
                        ? 'border-[#0d59f2] ring-2 ring-[#0d59f2]/20'
                        : 'border-slate-300 hover:border-slate-400'
                    }`}
            >
                {icon && (
                    <i className={`${icon} absolute left-3 text-slate-400`}></i>
                )}
                <span className={selectedOption ? 'text-slate-900' : 'text-slate-400'}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <i className={`fi fi-rr-angle-small-${isOpen ? 'up' : 'down'} absolute right-3 text-slate-400 transition-transform`}></i>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden animate-fade-in">
                    <div className="max-h-60 overflow-y-auto">
                        {options.map((option) => (
                            <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-colors ${value === option.value
                                        ? 'bg-[#0d59f2] text-white'
                                        : 'text-slate-700 hover:bg-slate-50'
                                    }`}
                            >
                                {value === option.value && (
                                    <i className="fi fi-sr-check text-xs"></i>
                                )}
                                <span className={value === option.value ? '' : 'ml-5'}>
                                    {option.label}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {hint && (
                <p className="mt-1 text-xs text-slate-400">{hint}</p>
            )}
        </div>
    );
}

export default CustomSelect;
