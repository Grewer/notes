import './button.css';
import { ButtonHTMLAttributes, ReactNode } from 'react';

// 定义按钮尺寸类型
type ButtonSize = 'small' | 'medium' | 'large';

// 定义按钮组件的属性接口
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Is this the principal call to action on the page? */
  primary?: boolean;
  /** What background color to use */
  backgroundColor?: string | null;
  /** How large should the button be? */
  size?: ButtonSize;
  /** Button contents */
  label: string | ReactNode;
}

/** Primary UI component for user interaction */
export const Button = ({
  primary = false,
  backgroundColor = null,
  size = 'medium',
  label,
  ...props
}: ButtonProps) => {
  const mode = primary ? 'storybook-button--primary' : 'storybook-button--secondary';
  return (
    <button
      type="button"
      className={['storybook-button', `storybook-button--${size}`, mode].join(' ')}
      style={backgroundColor ? { backgroundColor } : undefined}
      {...props}
    >
      {label}
    </button>
  );
};
