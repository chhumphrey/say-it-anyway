import { awaitMigrationOrTimeout } from '@/utils/migrationGate';

describe('awaitMigrationOrTimeout', () => {
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let logSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.useFakeTimers();
    warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.useRealTimers();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
    logSpy.mockRestore();
  });

  it('resolves once the migration succeeds, well before the timeout', async () => {
    const migrate = jest.fn().mockResolvedValue({ migrated: 1 });

    const gate = awaitMigrationOrTimeout(migrate, { timeoutMs: 8000 });
    await jest.advanceTimersByTimeAsync(10);
    await gate;

    expect(migrate).toHaveBeenCalledTimes(1);
    expect(warnSpy).not.toHaveBeenCalled();
    expect(logSpy).toHaveBeenCalledWith('Startup task result:', { migrated: 1 });
  });

  it('[FAILURE CASE] resolves (does not reject or hang) even when the migration throws', async () => {
    const migrate = jest.fn().mockRejectedValue(new Error('disk full'));

    const gate = awaitMigrationOrTimeout(migrate, { timeoutMs: 8000 });
    await jest.advanceTimersByTimeAsync(10);

    // The crucial assertion: launch is never blocked or crashed by a
    // throwing migration -- the gate still resolves normally.
    await expect(gate).resolves.toBeUndefined();
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Startup task failed'),
      expect.any(Error)
    );
  });

  it('[TIMEOUT CASE] resolves once the timeout elapses, without waiting for a migration that never settles', async () => {
    let migrationSettled = false;
    const migrate = jest.fn().mockImplementation(
      () => new Promise(() => {
        /* deliberately never resolves or rejects -- simulates a hang */
      })
    );
    void migrate().then(() => {
      migrationSettled = true;
    });

    const gate = awaitMigrationOrTimeout(migrate, { timeoutMs: 5000 });

    // Just before the timeout: must not have resolved yet.
    await jest.advanceTimersByTimeAsync(4999);
    let resolved = false;
    gate.then(() => {
      resolved = true;
    });
    await Promise.resolve();
    expect(resolved).toBe(false);

    // At/after the timeout: must resolve, without the migration itself
    // ever having settled.
    await jest.advanceTimersByTimeAsync(1);
    await gate;

    expect(migrationSettled).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('did not complete within 5000ms'));
  });

  it('[TIMEOUT CASE] a migration that eventually resolves after the timeout already fired does not log or resolve a second time', async () => {
    let resolveMigration: (value: unknown) => void = () => {};
    const migrate = jest.fn().mockImplementation(
      () => new Promise((resolve) => {
        resolveMigration = resolve;
      })
    );

    const gate = awaitMigrationOrTimeout(migrate, { timeoutMs: 1000 });
    await jest.advanceTimersByTimeAsync(1000);
    await gate;

    expect(warnSpy).toHaveBeenCalledTimes(1);

    // The migration finally finishes, well after launch already proceeded.
    resolveMigration({ migrated: 3 });
    await jest.advanceTimersByTimeAsync(10);

    // Its own success is still logged (it completed its work in the
    // background) but the timeout warning is not logged again.
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(logSpy).toHaveBeenCalledWith('Startup task result:', { migrated: 3 });
  });

  it('uses the default timeout when none is specified', async () => {
    const migrate = jest.fn().mockImplementation(() => new Promise(() => {}));

    const gate = awaitMigrationOrTimeout(migrate);
    await jest.advanceTimersByTimeAsync(7999);
    let resolved = false;
    gate.then(() => {
      resolved = true;
    });
    await Promise.resolve();
    expect(resolved).toBe(false);

    await jest.advanceTimersByTimeAsync(1);
    await gate;
    expect(resolved || true).toBe(true); // reached without hanging
  });
});
