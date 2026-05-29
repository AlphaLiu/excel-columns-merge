import type { ClipboardEvent, KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { useRef, useState } from 'react';

const SEPARATOR_RE = /[,，]/;

interface TagInputProps {
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function TagInput({
  value,
  onChange,
  placeholder = '输入列标题后按回车...',
  className,
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addTag = (raw: string) => {
    const items = raw
      .split(SEPARATOR_RE)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !value.includes(s));

    if (items.length > 0) {
      onChange([...value, ...items]);
    }
    setInputValue('');
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(t => t !== tagToRemove));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(inputValue);
    }
    else if (e.key === 'Backspace' && inputValue === '' && value.length > 0) {
      removeTag(value.at(-1)!);
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    addTag(pasted);
  };

  return (
    <div
      className={[
        'flex min-h-[48px] cursor-text flex-wrap items-center gap-2 rounded-full border bg-apple-canvas px-4 py-2.5 transition-all duration-150',
        isFocused
          ? 'border-apple-primary shadow-[0_0_0_3px] shadow-apple-primary/15'
          : 'border-apple-hairline hover:border-apple-ink-muted-48/40',
        className ?? '',
      ].join(' ')}
      onClick={() => inputRef.current?.focus()}
    >
      {value.map(tag => (
        <span
          key={tag}
          className="
            inline-flex items-center gap-1.5 rounded-full bg-apple-primary/10 px-3 py-1 text-caption font-medium
            text-apple-primary
          "
        >
          {tag}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeTag(tag);
            }}
            className="
              flex size-4 items-center justify-center rounded-full transition-colors
              hover:bg-apple-primary/20
              active:scale-90
            "
          >
            <X size={10} />
          </button>
        </span>
      ))}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={e => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onFocus={() => setIsFocused(true)}
        onBlur={() => {
          setIsFocused(false);
          if (inputValue.trim())
            addTag(inputValue);
        }}
        placeholder={value.length === 0 ? placeholder : ''}
        className="
          min-w-[160px] flex-1 border-none bg-transparent p-0 text-body text-apple-ink outline-none
          placeholder:text-apple-body-muted
        "
      />
    </div>
  );
}
