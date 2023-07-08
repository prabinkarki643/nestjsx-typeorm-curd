import { applyDecorators } from '@nestjs/common';
import { ApiQuery, ApiQueryOptions } from '@nestjs/swagger';
import { defaultQueryParams } from '../constants';

export function ApiQueryParams(options?: { apiQuery?: ApiQueryOptions }) {
  return applyDecorators(
    ApiQuery({
      name: 'query',
      type: 'object',
      required: false,
      example: defaultQueryParams,
      description: `<h4>Query Examples</h4>
      <ul>
        <li><i><b>fields:</b></i> ?fields[0]=A&fields[1]=B</li>
        <li><i><b>filter:</b></i> ?filter[0][field]=userName&filter[0][operator]=$eq&filter[0][value]=ABC</li>
        <li><i><b>or:</b></i> ?or[0][field]=userName&filter[0][operator]=$eq&filter[0][value]=ABC</li>
        <li><i><b>join:</b></i> ?join[0][field]=role</li>
        <li><i><b>sort:</b></i> ?sort[0][field]=role&sort[0][order]=DESC</li>
        <li><i><b>limit:</b></i> ?limit=50</li>
        <li><i><b>offset:</b></i> ?offset=0</li>
        <li><i><b>pagination:</b></i> ?pagination=true</li>
        <li><i><b>page:</b></i> ?page=1</li>
        <li><i><b>cache:</b></i> ?cache=false</li>
        <li><i><b>includeDeleted:</b></i> ?includeDeleted=false</li>
      </ul>
      <br/>
      <h4>Using qs Package</h4>
      <pre>
        <code>
          const qs = require('qs');
          const query = qs.stringify({
            filters: {
              username: {
                $eq: 'John',
              },
            },
          }, {
            encodeValuesOnly: true, // prettify URL
          });
          await request('/api/users?{query}');
        </code>
      </pre>
      `,
      ...options?.apiQuery,
    }),
  );
}
