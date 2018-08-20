import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';

const input = 'src/frameScheduling.ts';

export default [{
    input,
    output: [{
            file: pkg.main,
            format: 'cjs',
        },
        {
            file: pkg.module,
            format: 'es',
        },
    ],
    plugins: [
        typescript({
            typescript: require('typescript'),
            cacheRoot: './node_modules/.rts2_cache'
        }),
    ],
}, {
    input,
    output: [
        {
            file: pkg.es2015,
            format: 'es',
        },
    ],
    plugins: [
        typescript({
            typescript: require('typescript'),
            tsconfigOverride: { compilerOptions: { "target": "es2015", } },
            cacheRoot: './node_modules/.rts2_cache'
        }),
    ],
}]