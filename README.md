# Deliver private BackBlaze B2 files through Cloudflare

Guide
https://developers.cloudflare.com/workers/tutorials/configure-your-cdn/

Github repo:
https://github.com/codewithkristian/assets-on-workers

## Configuration
```
const config = {
  key: B2KeyID,
  secret: B2AppKey,
  bucket: B2BucketName
};
```
Create new application key at Backblaze fot your bucket.
Where `key` is a key id and `secret` it is application key. `bucket` backblaze bucket name
`B2KeyID`, `B2AppKey`, `B2BucketName` are environment variables at cloudfare.

```
const getB2Token = async (config) => {
  const { key, secret } = config;
  const res = await fetch('https://api.backblazeb2.com/b2api/v2/b2_authorize_account', {
    headers: {
      'Authorization': 'Basic ' + btoa(B2KeyID + ":" + B2AppKey)
    }
  });
  const data = await res.json();
  await B2CDN.put('auth', data.authorizationToken);
};
```

It's a function which gets the authoriztion token to get access to private bucket files.

It is stored at KV namespace `B2CDN`.
For the first time you can get it by command
```
curl https://api.backblazeb2.com/b2api/v2/b2_authorize_account -u "%key%:%secret%"
```

`getB2Token` is attached to `scheduled` event since token expires every 24 hours.
`getB2Token` gets the token and puts it to KV namespace `B2CDN` according to triggers configuration at cloudfare

Add custom domain for the worker `cdn.example.com`

Request
```
https://cdn.example.com/images/cat.jpg
```

Original request
```
https://f004.backblazeb2.com/file/%bucketname%/images/cat.jpg
```

Upload files to backblaze using B2 cli
https://www.backblaze.com/b2/docs/quick_command_line.html

```
./b2 authorize-account %id% %key%
./b2 sync "d:/files" "b2://bucketname/files"
```

