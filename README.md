# useAxiosQuery
useAxiosQuery is a wrapper around the [axios](https://github.com/axios/axios) HTTP Client, [axios-retry](https://github.com/softonic/axios-retry) and [@tanstack/react-query](https://github.com/TanStack/query)

- Automatically retries idempotent requests
- Automatically cancels outgoing http requests if the calling component of the `useAxiosQuery` hook unmounts
- Customizable 401 Status Code Handler
- Highly configurable

# Install
The following peer dependencies are required:
- [@tanstack/react-query](https://www.npmjs.com/package/@tanstack/react-query) `4.x.x`
- [react](https://www.npmjs.com/package/react) `17.x.x` or `18.x.x`

```
npm install @lgse/use-axios-query
```

# Usage

```typescript jsx
import { useAxiosQuery } from '@lgse/use-axios-query';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

type Todo = {
  completed: boolean;
  id: number;
  text: string;
}

type DataType = Todo[]

type AxiosResponseType = {
  todos: Todo[]
}

const Todos = () => {
  const [data, { error }] = useAxiosQuery<AxiosResponseType, DataType>(['todos'], (axios, cancelRequest) => {
    return axios.get('https://dummyjson.com/todos').then(({ data: { todos } }) => todos);
  });
  
  if (Array.isArray(data) && !data.length) {
    return <div>No todos to show</div>
  }
  
  if (Array.isArray(data) && data.length) {
    return data.map(({ completed, id, text }) => <div key={id}>{text}{completed ? ' - Done!' : ''}</div>;
  }

  if (error) {
    return <div>Error fetching todos :(</div>;
  }
  
  return <div>Loading...</div>
};

const App = () => {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <Todos />
    </QueryClientProvider>
  )
}
```

